<?php

namespace App\Services;

use App\Enums\StockMovementType;
use App\Models\Customer;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Profit;
use App\Models\Sale;
use App\Models\SaleItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class SaleService
{
    public function create(array $payload): Sale
    {
        return DB::transaction(function () use ($payload) {

            foreach ($payload['items'] as $item) {

                $product = Product::query()
                    ->findOrFail($item['product_id']);

                $quantity = (int) $item['quantity'];

                if ($quantity <= 0) {
                    throw ValidationException::withMessages([
                        'items' => "Insufficient stock for product: {$product->name}. ".
                            "Available: {$product->stock} units, ".
                            "requested: {$quantity} units.",
                    ]);
                }

                if ($quantity > $product->stock) {
                    throw ValidationException::withMessages([
                        'items' => "Insufficient stock for product: {$product->name}. ".
                            "Available: {$product->stock} units, ".
                            "requested: {$quantity} units.",
                    ]);
                }
            }

            /*
             * ============================================================
             * 2. GENERATE INVOICE NUMBER
             * ============================================================
             */
            // Example Output: INV-0Z9R4X
            // Grabs the highly unique ending entropy spectrum of a timestamp-sorted string
            $invoiceNumber = 'INV-'.strtoupper(substr(Str::ulid(), -6));

            $sale = Sale::query()->create([
                'invoice_number' => $invoiceNumber,
                'invoice_type' => $payload['invoice_type'],

                'customer_id' => $payload['customer_id'] ?? null,
                'customer_name' => $payload['customer_name'] ?? null,
                'customer_phone' => $payload['customer_phone'] ?? null,
                'customer_address' => $payload['customer_address'] ?? null,

                'subtotal' => $payload['subtotal'] ?? 0,
                'discount' => $payload['discount'] ?? 0,

                'previous_balance' => $payload['previous_balance'] ?? 0,

                'grand_total' => $payload['grand_total'] ?? 0,
                'paid_amount' => $payload['paid_amount'] ?? 0,
                'remaining_balance' => $payload['remaining_balance'] ?? 0,

                'created_by' => auth()->id(),
            ]);

            $customer = Customer::find($payload['customer_id'] ?? null);

            $customer->update([
                'baqaya' => $payload['remaining_balance'] ?? $customer->baqaya,
            ]);

            if ($payload['paid_amount']) {
                Payment::create([
                    'amount' => $payload['paid_amount'],
                    'payment_date' => now(),
                    'customer_id' => $payload['customer_id'],
                ]);

            }

            /*
             * ============================================================
             * 5. SAVE SALE ITEMS + UPDATE INVENTORY
             * ============================================================
             */

            $totalSaleProfit = 0;

            foreach ($payload['items'] as $item) {

                $product = Product::query()
                    ->findOrFail($item['product_id']);

                /*
                 * quantity is INDIVIDUAL ITEMS.
                 */
                $quantity = (int) $item['quantity'];
                $unitPrice = (float) $item['unit_price'];
                $itemDiscount = (float) ($item['discount'] ?? 0);

                /*
                 * ========================================================
                 * CALCULATE SALE TOTAL
                 * ========================================================
                 */
                $total = ($quantity * $unitPrice) - $itemDiscount;

                /*
                 * Calculate item profit snapshot using current buy_price
                 */
                $itemProfit = $total - ($product->buy_price * $quantity);
                $totalSaleProfit += $itemProfit;

                /*
                 * ========================================================
                 * CREATE SALE ITEM
                 * ========================================================
                 */
                SaleItem::query()->create([
                    'sale_id' => $sale->id,
                    'product_id' => $product->id,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'discount' => $itemDiscount,
                    'total' => $total,
                ]);

                $product->update([
                    'stock' => $product->stock - $quantity,
                ]);

                /*
                 * ========================================================
                 * RECORD STOCK MOVEMENT
                 * ========================================================
                 *
                 * The movement quantity is also individual units.
                 *
                 * Example:
                 * -19 = 19 individual items sold.
                 */
                app(ProductService::class)->recordStockMovement(
                    product: $product,
                    type: StockMovementType::SALE,
                    quantity: -$quantity,
                    notes: 'Sale stock reduction for Invoice: '.$invoiceNumber,
                    referenceType: Sale::class,
                    referenceId: $sale->id,
                );
            }

            Profit::query()->create([
                'sale_id' => $sale->id,
                'amount' => $totalSaleProfit,
            ]);

            /*
             * ============================================================
             * 6. RETURN SALE
             * ============================================================
             */
            return $sale;
        });
    }
}

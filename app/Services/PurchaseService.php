<?php

namespace App\Services;

use App\Enums\StockMovementType;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class PurchaseService
{
    public function create(array $payload): Purchase
    {
        return DB::transaction(function () use ($payload) {
            $purchase = Purchase::query()->create([
                'reference' => $payload['reference'],
                'purchased_at' => now(),
                'notes' => $payload['notes'] ?? null,
                'subtotal' => $payload['subtotal'] ?? 0,
                'total' => $payload['total'] ?? 0,
                'user_id' => auth()->id(),
            ]);

            foreach ($payload['items'] as $item) {
                $product = Product::query()->findOrFail($item['product_id']);
                $quantity = (int) $item['quantity'];
                $unitCost = (float) $item['unit_cost'];
                $total = $quantity * $unitCost;

                PurchaseItem::query()->create([
                    'purchase_id' => $purchase->id,
                    'product_id' => $product->id,
                    'quantity' => $quantity,
                    'unit_cost' => $unitCost,
                    'total' => $total,
                ]);

                $product->increment('stock', $quantity);

                app(ProductService::class)->recordStockMovement(
                    product: $product,
                    type: StockMovementType::PURCHASE,
                    quantity: $quantity,
                    notes: 'Purchase stock increase',
                    referenceType: Purchase::class,
                    referenceId: $purchase->id,
                );
            }

            return $purchase;
        });
    }
}

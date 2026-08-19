<?php

namespace App\Services;

use App\Enums\StockMovementType;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class ProductService
{
    public function list(array $filters = []): Collection
    {
        $query = Product::query()
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
            })
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->orderByDesc('created_at');

        return $query->get();
    }

    public function create(StoreProductRequest $request): Product
    {
        return DB::transaction(function () use ($request) {
            $product = Product::query()->create($request->validated());

            $this->recordStockMovement(
                product: $product,
                type: StockMovementType::ADJUSTMENT,
                quantity: (int) $product->stock,
                notes: 'Initial stock entry',
            );

            return $product;
        });
    }

    public function update(UpdateProductRequest $request, Product $product): Product
    {
        return DB::transaction(function () use ($request, $product) {
            $previousStock = (int) $product->stock;
            $payload = $request->validated();
            $product->update($payload);

            $delta = $product->stock - $previousStock;
            if ($delta !== 0) {
                $this->recordStockMovement(
                    product: $product,
                    type: StockMovementType::ADJUSTMENT,
                    quantity: $delta,
                    notes: 'Stock adjusted via product update',
                );
            }

            return $product->fresh();
        });
    }

    public function delete(Product $product): void
    {
        DB::transaction(function () use ($product) {
            $product->delete();
        });
    }

    public function lowStockAlertProducts(): Collection
    {
        return Product::query()
            ->whereColumn('stock', '<=', 'minimum_stock')
            ->get();
    }

    public function recordStockMovement(Product $product, StockMovementType $type, int $quantity, ?string $notes = null, ?string $referenceType = null, ?int $referenceId = null): StockMovement
    {
        return StockMovement::query()->create([
            'product_id' => $product->id,
            'type' => $type->value,
            'quantity' => $quantity,
            'reference_type' => $referenceType,
            'reference_id' => $referenceId,
            'notes' => $notes,
            'user_id' => auth()->id() ?? 1,
        ]);
    }
}

<?php

namespace App\Services;

use App\Models\Customer;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class CustomerService
{
    public function list(array $filters = []): Collection
    {
        return Customer::query()
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->orderByDesc('created_at')
            ->get();
    }

    public function create(array $payload): Customer
    {
        return DB::transaction(fn () => Customer::query()->create($payload));
    }

    public function update(Customer $customer, array $payload): Customer
    {
        return DB::transaction(function () use ($customer, $payload) {
            $customer->update($payload);

            return $customer->fresh();
        });
    }

    public function delete(Customer $customer): void
    {
        DB::transaction(fn () => $customer->delete());
    }
}

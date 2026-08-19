<?php

namespace App\Services;

use App\Models\Expense;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class ExpenseService
{
    public function list(array $filters = []): Collection
    {
        return Expense::query()
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where('notes', 'like', "%{$search}%");
            })
            ->orderByDesc('date')
            ->get();
    }

    public function create(array $payload): Expense
    {
        return DB::transaction(fn () => Expense::query()->create($payload));
    }

    public function update(Expense $expense, array $payload): Expense
    {
        return DB::transaction(function () use ($expense, $payload) {
            $expense->update($payload);

            return $expense->fresh();
        });
    }

    public function delete(Expense $expense): void
    {
        DB::transaction(fn () => $expense->delete());
    }
}

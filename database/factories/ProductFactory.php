<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->words(3, true),
            'buy_price' => $this->faker->randomFloat(2, 5, 150),
            'sell_price' => $this->faker->randomFloat(2, 15, 250),
            'stock' => $this->faker->numberBetween(0, 50),
            'minimum_stock' => $this->faker->numberBetween(1, 10),
            'status' => 'active',
        ];
    }
}

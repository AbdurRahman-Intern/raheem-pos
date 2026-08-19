<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class InventoryMvpTest extends TestCase
{
    use WithFaker;

    public function test_product_index_requires_authentication(): void
    {
        $response = $this->get('/products');

        $response->assertRedirect('/login');
    }

    public function test_authenticated_user_can_create_product(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/products', [
            'name' => 'Ledger Paper',
            'sku' => 'SKU-1001',
            'barcode' => 'BAR-1001',
            'buy_price' => 12.5,
            'sell_price' => 22.0,
            'stock' => 10,
            'minimum_stock' => 3,
            'description' => 'A4 copy paper',
            'status' => 'active',
            'features' => ['pack' => 'A4'],
        ]);

        $response->assertRedirect('/products');

        $this->assertDatabaseHas('products', [
            'sku' => 'SKU-1001',
            'barcode' => 'BAR-1001',
            'name' => 'Ledger Paper',
        ]);
    }

    public function test_dashboard_loads_for_authenticated_user(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertOk();
    }
}

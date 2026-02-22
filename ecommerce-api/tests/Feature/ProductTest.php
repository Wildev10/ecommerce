<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductTest extends TestCase
{
    use RefreshDatabase;

    private function createProductsWithCategory(int $count = 5): void
    {
        $seller = User::factory()->create(['role' => 'seller']);
        $category = Category::create([
            'name'      => 'Test Category',
            'slug'      => 'test-category',
            'is_active' => true,
        ]);

        for ($i = 0; $i < $count; $i++) {
            Product::create([
                'seller_id'   => $seller->id,
                'category_id' => $category->id,
                'name'        => "Product {$i}",
                'slug'        => "product-{$i}",
                'description' => "Description for product {$i}",
                'price'       => rand(1000, 100000),
                'compare_price' => rand(1000, 100000) + 5000,
                'stock'       => rand(0, 100),
                'is_active'   => true,
            ]);
        }
    }

    public function test_can_list_products(): void
    {
        $this->createProductsWithCategory();

        $response = $this->getJson('/api/products');

        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonStructure([
                'data',
                'meta' => ['current_page', 'total'],
            ]);
    }

    public function test_can_get_single_product(): void
    {
        $this->createProductsWithCategory(1);
        $product = Product::first();

        $response = $this->getJson("/api/products/{$product->slug}");

        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonPath('data.id', $product->id);
    }

    public function test_can_get_featured_products(): void
    {
        $this->createProductsWithCategory(3);

        $response = $this->getJson('/api/products/featured');

        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    public function test_can_search_products(): void
    {
        $this->createProductsWithCategory(3);

        $response = $this->getJson('/api/search?q=Product');

        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonStructure([
                'data' => ['products', 'categories', 'counts'],
            ]);
    }
}

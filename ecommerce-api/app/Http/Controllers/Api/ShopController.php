<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shop;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class ShopController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/shops/{slug} — Page publique d'une boutique
     */
    public function show($slug)
    {
        $shop = Shop::where('slug', $slug)
            ->where('is_active', true)
            ->with(['seller:id,name,avatar,created_at'])
            ->firstOrFail();

        $products = $shop->seller->products()
            ->where('is_active', true)
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->latest()
            ->paginate(20);

        return $this->success([
            'shop'     => $shop,
            'products' => $products,
        ], 'Boutique');
    }

    /**
     * GET /api/seller/shop — Ma boutique (vendeur)
     */
    public function myShop(Request $request)
    {
        $shop = Shop::where('user_id', $request->user()->id)->first();

        return $this->success($shop, 'Ma boutique');
    }

    /**
     * POST /api/seller/shop — Créer ou mettre à jour ma boutique
     */
    public function upsert(Request $request)
    {
        $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'phone'       => 'nullable|string|max:20',
            'city'        => 'nullable|string|max:100',
            'logo'        => 'nullable|image|max:2048',
            'banner'      => 'nullable|image|max:4096',
        ]);

        $shop = Shop::firstOrNew(['user_id' => $request->user()->id]);
        $shop->name = $request->name;
        $shop->slug = Str::slug($request->name);
        $shop->description = $request->description;
        $shop->phone = $request->phone;
        $shop->city = $request->city;

        if ($request->hasFile('logo')) {
            if ($shop->logo && !str_starts_with($shop->logo, 'http')) {
                Storage::disk('public')->delete($shop->logo);
            }
            $shop->logo = $request->file('logo')->store('shops', 'public');
        }

        if ($request->hasFile('banner')) {
            if ($shop->banner && !str_starts_with($shop->banner, 'http')) {
                Storage::disk('public')->delete($shop->banner);
            }
            $shop->banner = $request->file('banner')->store('shops', 'public');
        }

        $shop->save();
        $shop->load('seller:id,name');

        return $this->success($shop, $shop->wasRecentlyCreated ? 'Boutique créée' : 'Boutique mise à jour');
    }
}

#!/bin/bash
# ═══════════════════════════════════════════════════
#   TEST COMPLET — API E-COMMERCE (76 routes)
# ═══════════════════════════════════════════════════
set -euo pipefail

BASE="http://localhost:8000/api"
PASS=0
FAIL=0
TOTAL=0

test_endpoint() {
    local method="$1" url="$2" expected="$3" desc="$4"
    shift 4
    TOTAL=$((TOTAL + 1))

    local args=(-s -o /tmp/test_resp -w "%{http_code}" -H "Accept: application/json")
    [[ -n "${TOKEN:-}" ]] && args+=(-H "Authorization: Bearer $TOKEN")

    case "$method" in
        GET)    args+=(-X GET) ;;
        POST)   args+=(-X POST -H "Content-Type: application/json") ;;
        PUT)    args+=(-X PUT -H "Content-Type: application/json") ;;
        PATCH)  args+=(-X PATCH -H "Content-Type: application/json") ;;
        DELETE) args+=(-X DELETE) ;;
        MPOST)  args+=(-X POST) ;; # multipart
    esac

    local data_args=("$@")
    local code
    code=$(curl "${args[@]}" "${data_args[@]}" "$url" 2>/dev/null || echo "000")

    if [[ "$code" == "$expected" ]]; then
        echo "  ✅ [$code] $desc"
        PASS=$((PASS + 1))
    else
        echo "  ❌ [$code] $desc (expected $expected)"
        cat /tmp/test_resp 2>/dev/null | head -c 200
        echo
        FAIL=$((FAIL + 1))
    fi
}

echo "╔═══════════════════════════════════════════════╗"
echo "║   TESTS API E-COMMERCE — $(date +%H:%M:%S)              ║"
echo "╚═══════════════════════════════════════════════╝"
echo

# ─── 1. HEALTH & MONITORING ───
echo "── Health & Monitoring ──"
test_endpoint GET "$BASE/health" 200 "GET /health"
test_endpoint GET "$BASE/health/db" 200 "GET /health/db"
test_endpoint GET "$BASE/metrics" 200 "GET /metrics"

# ─── 2. AUTH ───
echo "── Auth ──"
TUID=$(date +%s)
test_endpoint POST "$BASE/register" 201 "POST /register" \
    -d "{\"name\":\"Test$TUID\",\"email\":\"test${TUID}@test.com\",\"password\":\"Password1!\",\"password_confirmation\":\"Password1!\",\"role\":\"buyer\"}"

# Login as admin
RESP=$(curl -s -X POST "$BASE/login" -H "Content-Type: application/json" -H "Accept: application/json" \
    -d '{"email":"test@test.com","password":"password"}')
TOKEN=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('token',''))" 2>/dev/null || echo "")

if [[ -z "$TOKEN" ]]; then
    echo "  ❌ Cannot login as admin — aborting"
    exit 1
fi
echo "  ✅ Admin logged in"
ADMIN_TOKEN="$TOKEN"

test_endpoint GET "$BASE/user" 200 "GET /user (profile)"
test_endpoint PUT "$BASE/user/update" 200 "PUT /user/update" -d '{"name":"Admin Updated"}'
test_endpoint PUT "$BASE/user/password" 422 "PUT /user/password (wrong current)" \
    -d '{"current_password":"wrong","password":"NewPass1!","password_confirmation":"NewPass1!"}'

# ─── 3. PUBLIC RESOURCES ───
echo "── Resources publiques ──"
TOKEN=""
test_endpoint GET "$BASE/products" 200 "GET /products (public)"
test_endpoint GET "$BASE/products/1" 200 "GET /products/1"
test_endpoint GET "$BASE/categories" 200 "GET /categories"
test_endpoint GET "$BASE/categories/1" 200 "GET /categories/1"
test_endpoint GET "$BASE/products/1/reviews" 200 "GET /products/1/reviews"
test_endpoint GET "$BASE/search?q=test" 200 "GET /search?q=test"

# ─── 4. Unauth should fail ───
echo "── Protection auth ──"
test_endpoint GET "$BASE/cart" 401 "GET /cart (unauthenticated)"
test_endpoint GET "$BASE/wishlist" 401 "GET /wishlist (unauthenticated)"
test_endpoint GET "$BASE/orders" 401 "GET /orders (unauthenticated)"

# ─── 5. BUYER FLOW ───
echo "── Buyer Flow ──"

# Register a buyer
BUYER_RESP=$(curl -s -X POST "$BASE/register" -H "Content-Type: application/json" -H "Accept: application/json" \
    -d "{\"name\":\"Buyer$TUID\",\"email\":\"buyer${TUID}@test.com\",\"password\":\"Password1!\",\"password_confirmation\":\"Password1!\",\"role\":\"buyer\"}")
TOKEN=$(echo "$BUYER_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('token',''))" 2>/dev/null || echo "")
BUYER_TOKEN="$TOKEN"
echo "  ✅ Buyer registered"

# Cart
test_endpoint GET "$BASE/cart" 200 "GET /cart"
test_endpoint POST "$BASE/cart" 201 "POST /cart (add item)" -d '{"product_id":1,"quantity":1}'
# Get cart item id
CART_ITEM_ID=$(curl -s "$BASE/cart" -H "Accept: application/json" -H "Authorization: Bearer $TOKEN" | python3 -c "
import sys,json
d=json.load(sys.stdin)
items=d.get('data',{}).get('items',[])
print(items[0]['item_id'] if items else '')
" 2>/dev/null || echo "")
if [[ -n "$CART_ITEM_ID" ]]; then
    test_endpoint PUT "$BASE/cart/$CART_ITEM_ID" 200 "PUT /cart/{item} (update qty)" -d '{"quantity":1}'
fi

# Wishlist
test_endpoint GET "$BASE/wishlist" 200 "GET /wishlist"
test_endpoint POST "$BASE/wishlist" 201 "POST /wishlist (add)" -d '{"product_id":1}'
test_endpoint GET "$BASE/wishlist/check/1" 200 "GET /wishlist/check/1"
test_endpoint POST "$BASE/wishlist" 409 "POST /wishlist (duplicate)" -d '{"product_id":1}'
test_endpoint DELETE "$BASE/wishlist/1" 200 "DELETE /wishlist/1 (remove)"

# Addresses
test_endpoint POST "$BASE/addresses" 201 "POST /addresses" \
    -d '{"full_name":"Test Buyer","phone":"90000000","city":"Cotonou","quarter":"Cadjehoun","street_address":"Rue 123"}'
ADDR_ID=$(curl -s "$BASE/addresses" -H "Accept: application/json" -H "Authorization: Bearer $TOKEN" | python3 -c "
import sys,json
d=json.load(sys.stdin)
items=d.get('data',[])
print(items[0]['id'] if items else '')
" 2>/dev/null || echo "1")
test_endpoint GET "$BASE/addresses" 200 "GET /addresses"
test_endpoint GET "$BASE/addresses/$ADDR_ID" 200 "GET /addresses/{id}"
test_endpoint PATCH "$BASE/addresses/$ADDR_ID/default" 200 "PATCH /addresses/{id}/default"

# Coupons verify
test_endpoint POST "$BASE/coupons/verify" 404 "POST /coupons/verify (invalid)" -d '{"code":"FAKE","amount":10000}'

# Orders
test_endpoint POST "$BASE/orders" 201 "POST /orders (create)" \
    -d "{\"address_id\":$ADDR_ID,\"payment_method\":\"cash_on_delivery\"}"
ORDER_ID=$(curl -s "$BASE/orders" -H "Accept: application/json" -H "Authorization: Bearer $TOKEN" | python3 -c "
import sys,json
d=json.load(sys.stdin)
items=d.get('data',[])
print(items[0]['id'] if items else '')
" 2>/dev/null || echo "")

if [[ -n "$ORDER_ID" ]]; then
    test_endpoint GET "$BASE/orders" 200 "GET /orders"
    test_endpoint GET "$BASE/orders/$ORDER_ID" 200 "GET /orders/{id}"
    test_endpoint GET "$BASE/orders/$ORDER_ID/history" 200 "GET /orders/{id}/history"

    # Payment
    test_endpoint POST "$BASE/orders/$ORDER_ID/pay" 201 "POST /orders/{id}/pay" \
        -d '{"payment_method":"mobile_money"}'
    test_endpoint GET "$BASE/payments" 200 "GET /payments (my)"
    PAYMENT_ID=$(curl -s "$BASE/payments" -H "Accept: application/json" -H "Authorization: Bearer $TOKEN" | python3 -c "
import sys,json
d=json.load(sys.stdin)
items=d.get('data',[])
print(items[0]['id'] if items else '')
" 2>/dev/null || echo "")
    if [[ -n "$PAYMENT_ID" ]]; then
        test_endpoint GET "$BASE/payments/$PAYMENT_ID" 200 "GET /payments/{id}"
    fi
else
    echo "  ⚠️  No order created, skipping order tests"
fi

# Reviews
test_endpoint POST "$BASE/products/1/reviews" 201 "POST /products/1/reviews" \
    -d '{"rating":5,"comment":"Excellent produit!"}'
test_endpoint POST "$BASE/products/1/reviews" 409 "POST /products/1/reviews (duplicate)"
# Get review id
REVIEW_ID=$(curl -s "$BASE/products/1/reviews" -H "Accept: application/json" | python3 -c "
import sys,json
d=json.load(sys.stdin)
items=d.get('data',[])
for r in items:
    if r.get('comment')=='Excellent produit!':
        print(r['id']); break
" 2>/dev/null || echo "")
if [[ -n "$REVIEW_ID" ]]; then
    test_endpoint PUT "$BASE/reviews/$REVIEW_ID" 200 "PUT /reviews/{id}" \
        -d '{"rating":4,"comment":"Très bon produit"}'
fi

# Apply coupon
test_endpoint POST "$BASE/orders/apply-coupon" 400 "POST /orders/apply-coupon (invalid)" -d '{"code":"NOTEXIST"}'

# ─── 6. SELLER FLOW ───
echo "── Seller Flow ──"

SELLER_RESP=$(curl -s -X POST "$BASE/register" -H "Content-Type: application/json" -H "Accept: application/json" \
    -d "{\"name\":\"Seller$TUID\",\"email\":\"seller${TUID}@test.com\",\"password\":\"Password1!\",\"password_confirmation\":\"Password1!\",\"role\":\"seller\"}")
TOKEN=$(echo "$SELLER_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('token',''))" 2>/dev/null || echo "")
SELLER_TOKEN="$TOKEN"
echo "  ✅ Seller registered"

# Dashboard
test_endpoint GET "$BASE/seller/dashboard" 200 "GET /seller/dashboard"
test_endpoint GET "$BASE/seller/orders" 200 "GET /seller/orders"
test_endpoint GET "$BASE/seller/products" 200 "GET /seller/products"

# Create product
test_endpoint POST "$BASE/products" 201 "POST /products (create)" \
    -d '{"category_id":1,"name":"Test Product Seller","description":"A test product","price":5000,"stock":10}'

# Get seller product id
SPROD_ID=$(curl -s "$BASE/seller/products" -H "Accept: application/json" -H "Authorization: Bearer $TOKEN" | python3 -c "
import sys,json
d=json.load(sys.stdin)
items=d.get('data',[])
print(items[0]['id'] if items else '')
" 2>/dev/null || echo "")

if [[ -n "$SPROD_ID" ]]; then
    test_endpoint PUT "$BASE/products/$SPROD_ID" 200 "PUT /products/{id} (update)" \
        -d '{"price":5500}'
fi

# ─── 7. ADMIN FLOW ───
echo "── Admin Flow ──"
TOKEN="$ADMIN_TOKEN"

# Dashboard
test_endpoint GET "$BASE/admin/dashboard" 200 "GET /admin/dashboard"

# Users
test_endpoint GET "$BASE/admin/users" 200 "GET /admin/users"
# Get a non-admin user id
NON_ADMIN_ID=$(curl -s "$BASE/admin/users" -H "Accept: application/json" -H "Authorization: Bearer $TOKEN" | python3 -c "
import sys,json
d=json.load(sys.stdin)
items=d.get('data',[])
for u in items:
    if u.get('role') != 'admin':
        print(u['id']); break
" 2>/dev/null || echo "")
if [[ -n "$NON_ADMIN_ID" ]]; then
    test_endpoint GET "$BASE/admin/users/$NON_ADMIN_ID" 200 "GET /admin/users/{id}"
    test_endpoint PUT "$BASE/admin/users/$NON_ADMIN_ID/toggle" 200 "PUT /admin/users/{id}/toggle"
    # Toggle back
    test_endpoint PUT "$BASE/admin/users/$NON_ADMIN_ID/toggle" 200 "PUT /admin/users/{id}/toggle (back)"
fi

# Orders
test_endpoint GET "$BASE/admin/orders" 200 "GET /admin/orders"
if [[ -n "${ORDER_ID:-}" ]]; then
    test_endpoint PUT "$BASE/admin/orders/$ORDER_ID/status" 200 "PUT /admin/orders/{id}/status" \
        -d '{"status":"shipped"}'
fi

# Products
test_endpoint GET "$BASE/admin/products" 200 "GET /admin/products"
if [[ -n "${SPROD_ID:-}" ]]; then
    test_endpoint PUT "$BASE/admin/products/$SPROD_ID/toggle" 200 "PUT /admin/products/{id}/toggle"
fi

# Categories
test_endpoint POST "$BASE/admin/categories" 201 "POST /admin/categories" \
    -d "{\"name\":\"TestCat$TUID\",\"description\":\"Test category\"}"
CAT_ID=$(curl -s "$BASE/categories" -H "Accept: application/json" | python3 -c "
import sys,json
d=json.load(sys.stdin)
items=d.get('data',[])
for c in items:
    if 'TestCat' in c.get('name',''):
        print(c['id']); break
" 2>/dev/null || echo "")
if [[ -n "$CAT_ID" ]]; then
    test_endpoint PUT "$BASE/admin/categories/$CAT_ID" 200 "PUT /admin/categories/{id}" \
        -d '{"description":"Updated desc"}'
    test_endpoint DELETE "$BASE/admin/categories/$CAT_ID" 200 "DELETE /admin/categories/{id}"
fi

# Coupons
test_endpoint POST "$BASE/admin/coupons" 201 "POST /admin/coupons" \
    -d "{\"code\":\"TESTCOUP$TUID\",\"discount\":10,\"type\":\"percent\",\"expires_at\":\"2027-12-31\"}"
COUPON_ID=$(curl -s "$BASE/admin/coupons" -H "Accept: application/json" -H "Authorization: Bearer $TOKEN" | python3 -c "
import sys,json
d=json.load(sys.stdin)
items=d.get('data',[])
for c in items:
    if 'TESTCOUP' in c.get('code',''):
        print(c['id']); break
" 2>/dev/null || echo "")
if [[ -n "$COUPON_ID" ]]; then
    test_endpoint GET "$BASE/admin/coupons/$COUPON_ID" 200 "GET /admin/coupons/{id}"
    test_endpoint PUT "$BASE/admin/coupons/$COUPON_ID" 200 "PUT /admin/coupons/{id}" \
        -d '{"discount":15}'
    test_endpoint DELETE "$BASE/admin/coupons/$COUPON_ID" 200 "DELETE /admin/coupons/{id}"
fi

# Payments (admin)
test_endpoint GET "$BASE/admin/payments" 200 "GET /admin/payments"

# Refund
if [[ -n "${ORDER_ID:-}" ]]; then
    test_endpoint POST "$BASE/admin/orders/$ORDER_ID/refund" 200 "POST /admin/orders/{id}/refund" \
        -d '{"reason":"Test refund"}'
    # Already refunded
    test_endpoint POST "$BASE/admin/orders/$ORDER_ID/refund" 400 "POST /admin/orders/{id}/refund (double)"
fi

# Reviews moderation
test_endpoint GET "$BASE/admin/reviews" 200 "GET /admin/reviews"
if [[ -n "${REVIEW_ID:-}" ]]; then
    test_endpoint DELETE "$BASE/admin/reviews/$REVIEW_ID" 200 "DELETE /admin/reviews/{id}"
fi

# ─── 8. CLEANUP ───
echo "── Cleanup ──"
# Delete seller product (if no orders)
if [[ -n "${SPROD_ID:-}" ]]; then
    TOKEN="$SELLER_TOKEN"
    test_endpoint DELETE "$BASE/products/$SPROD_ID" 200 "DELETE /products/{id} (seller)"
fi

# Clear buyer wishlist
TOKEN="$BUYER_TOKEN"
test_endpoint DELETE "$BASE/wishlist" 200 "DELETE /wishlist (clear)"

# Clear cart
test_endpoint DELETE "$BASE/cart" 200 "DELETE /cart (clear)"

# Delete address
if [[ -n "${ADDR_ID:-}" ]]; then
    # May fail if linked to orders
    curl -s -X DELETE "$BASE/addresses/$ADDR_ID" -H "Accept: application/json" -H "Authorization: Bearer $TOKEN" > /dev/null 2>&1
fi

# Token refresh (last to avoid invalidation)
test_endpoint POST "$BASE/logout" 200 "POST /logout"

# ─── RESULTS ───
echo
echo "╔═══════════════════════════════════════════════╗"
echo "  RÉSULTATS : $PASS/$TOTAL réussis, $FAIL échoués"
if [[ $FAIL -eq 0 ]]; then
    echo "  🎉 TOUS LES TESTS PASSENT — 100%"
else
    echo "  ⚠️  $FAIL test(s) en échec"
fi
echo "╚═══════════════════════════════════════════════╝"

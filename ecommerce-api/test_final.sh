#!/bin/bash
# Final Test Suite v4 — All fixes applied
BASE="http://localhost:8000/api"
TOKEN=$(cat /tmp/test_token.txt)
A="Accept: application/json"
C="Content-Type: application/json"

PASS=0; FAIL=0; RESULTS=""

t() {
    local M="$1" U="$2" EXP="$3" D="$4" DATA="$5" TOK="$6"
    local CMD="curl -s -o /dev/null -w %{http_code} -X $M"
    [ "$TOK" = "A" ] && CMD="$CMD -H \"Authorization: Bearer $TOKEN\""
    [[ "$TOK" == B:* ]] && CMD="$CMD -H \"Authorization: Bearer ${TOK#B:}\""
    CMD="$CMD -H \"$A\""
    [ -n "$DATA" ] && CMD="$CMD -H \"$C\" -d '$DATA'"
    CMD="$CMD $BASE$U"
    ACT=$(eval $CMD)
    if [ "$ACT" = "$EXP" ]; then S="✅"; PASS=$((PASS+1)); else S="❌"; FAIL=$((FAIL+1)); fi
    RESULTS="$RESULTS\n| $M | \`$U\` | $EXP | $ACT | $S | $D |"
}

echo "🔄 Final comprehensive test suite..."

# ═══ HEALTH (3) ═══
t GET /health 200 "Health check" "" ""
t GET /health/db 200 "DB health" "" ""
t GET /metrics 200 "Metrics" "" ""

# ═══ AUTH PUBLIC (4) ═══
R=$RANDOM
t POST /register 201 "Register" "{\"name\":\"U$R\",\"email\":\"u${R}@e.com\",\"password\":\"password123\",\"password_confirmation\":\"password123\"}" ""
BUYER_TOK=$(curl -s -X POST "$BASE/login" -H "$A" -H "$C" -d "{\"email\":\"u${R}@e.com\",\"password\":\"password123\"}" | python3 -c "import sys,json;print(json.load(sys.stdin)['data']['token'])" 2>/dev/null)
t POST /login 200 "Login" "{\"email\":\"u${R}@e.com\",\"password\":\"password123\"}" ""
t POST /login 401 "Bad password" "{\"email\":\"u${R}@e.com\",\"password\":\"x\"}" ""
t POST /register 422 "Dup email" "{\"name\":\"X\",\"email\":\"u${R}@e.com\",\"password\":\"password123\",\"password_confirmation\":\"password123\"}" ""

# ═══ PUBLIC (6) ═══
t GET /products 200 "List products" "" ""
t GET "/products/1" 200 "Show product" "" ""
t GET "/products/99999" 404 "Product 404" "" ""
t GET /categories 200 "List categories" "" ""
t GET "/categories/1" 200 "Show category" "" ""
t GET "/products/1/reviews" 200 "Reviews public" "" ""

# ═══ AUTH PROFILE (4) ═══
t GET /user 200 "Profile" "" A
t PUT /user/update 200 "Update profile" '{"name":"Admin"}' A
t PUT /user/password 200 "Change pwd" '{"current_password":"password","password":"password","password_confirmation":"password"}' A
t GET /user 401 "No auth 401" "" ""

# ═══ CART (7) ═══
t GET /cart 200 "View cart" "" A
t POST /cart 201 "Add to cart" '{"product_id":1,"quantity":1}' A
t GET /cart 200 "Cart after add" "" A

CID=$(curl -s "$BASE/cart" -H "Authorization: Bearer $TOKEN" -H "$A" | python3 -c "import sys,json;d=json.load(sys.stdin);i=d.get('data',{}).get('items',[]);print(i[0]['id'] if i else '')" 2>/dev/null)
[ -n "$CID" ] && t PUT "/cart/$CID" 200 "Update qty" '{"quantity":3}' A
[ -n "$CID" ] && t DELETE "/cart/$CID" 200 "Remove item" "" A
t POST /cart 201 "Re-add" '{"product_id":1,"quantity":2}' A
t DELETE /cart 200 "Clear cart" "" A

# ═══ ADDRESSES (6) ═══
t GET /addresses 200 "List addr" "" A
t POST /addresses 201 "Create addr" '{"label":"Test","full_name":"Will","phone":"97111","city":"Cotonou","quarter":"Cadj","street_address":"123 Rue"}' A

AID=$(curl -s "$BASE/addresses" -H "Authorization: Bearer $TOKEN" -H "$A" | python3 -c "import sys,json;d=json.load(sys.stdin);a=d.get('data',[]);print(a[-1]['id'] if a else '')" 2>/dev/null)
[ -n "$AID" ] && t GET "/addresses/$AID" 200 "Show addr" "" A
[ -n "$AID" ] && t PUT "/addresses/$AID" 200 "Update addr" '{"label":"Updated"}' A
[ -n "$AID" ] && t PATCH "/addresses/$AID/default" 200 "Set default" "" A

# ═══ COUPONS VERIFY (2) ═══
t POST /coupons/verify 422 "Verify no code" '{}' A
t POST /coupons/verify 422 "Verify missing amount" '{"code":"FAKE"}' A

# ═══ ORDERS (6) ═══
FADDR=$(curl -s "$BASE/addresses" -H "Authorization: Bearer $TOKEN" -H "$A" | python3 -c "import sys,json;d=json.load(sys.stdin);a=d.get('data',[]);print(a[0]['id'] if a else '')" 2>/dev/null)
curl -s -X POST "$BASE/cart" -H "Authorization: Bearer $TOKEN" -H "$A" -H "$C" -d '{"product_id":1,"quantity":1}' > /dev/null

t POST /orders 201 "Create order" "{\"address_id\":$FADDR,\"payment_method\":\"cash_on_delivery\"}" A
t GET /orders 200 "List orders" "" A

OID=$(curl -s "$BASE/orders" -H "Authorization: Bearer $TOKEN" -H "$A" | python3 -c "
import sys,json;d=json.load(sys.stdin);dat=d.get('data',{})
o=dat.get('data',[]) if isinstance(dat,dict) and 'data' in dat else []
print(o[0]['id'] if o else '')
" 2>/dev/null)

[ -n "$OID" ] && t GET "/orders/$OID" 200 "Show order" "" A
[ -n "$OID" ] && t POST "/orders/$OID/cancel" 200 "Cancel order" "" A
t POST /orders/apply-coupon 400 "Bad coupon" '{"code":"NOPE"}' A

# Create another for payment test
curl -s -X POST "$BASE/cart" -H "Authorization: Bearer $TOKEN" -H "$A" -H "$C" -d '{"product_id":1,"quantity":1}' > /dev/null
POID=$(curl -s -X POST "$BASE/orders" -H "Authorization: Bearer $TOKEN" -H "$A" -H "$C" -d "{\"address_id\":$FADDR,\"payment_method\":\"mobile_money\"}" | python3 -c "import sys,json;d=json.load(sys.stdin);print(d.get('data',{}).get('id',''))" 2>/dev/null)
[ -n "$POID" ] && t PUT "/orders/$POID/status" 200 "Update status" '{"status":"confirmed"}' A

# ═══ PAYMENTS (3) ═══
[ -n "$POID" ] && t POST "/orders/$POID/pay" 201 "Pay order" '{"payment_method":"mobile_money"}' A
t GET /payments 200 "My payments" "" A

PYID=$(curl -s "$BASE/payments" -H "Authorization: Bearer $TOKEN" -H "$A" | python3 -c "
import sys,json;d=json.load(sys.stdin);dat=d.get('data',{})
p=dat.get('data',[]) if isinstance(dat,dict) and 'data' in dat else []
print(p[0]['id'] if p else '')
" 2>/dev/null)
[ -n "$PYID" ] && t GET "/payments/$PYID" 200 "Show payment" "" A

# ═══ REVIEWS (3 — buyer) ═══
[ -n "$BUYER_TOK" ] && t POST "/products/1/reviews" 201 "Create review" '{"rating":5,"comment":"Super"}' "B:$BUYER_TOK"

RID=$(curl -s "$BASE/products/1/reviews" -H "$A" | python3 -c "import sys,json;d=json.load(sys.stdin);r=d.get('data',[]);print(r[-1]['id'] if r else '')" 2>/dev/null)
[ -n "$RID" ] && [ -n "$BUYER_TOK" ] && t PUT "/reviews/$RID" 200 "Update review" '{"rating":4}' "B:$BUYER_TOK"
[ -n "$RID" ] && [ -n "$BUYER_TOK" ] && t DELETE "/reviews/$RID" 200 "Delete review" "" "B:$BUYER_TOK"

# ═══ SELLER (4) ═══
t GET /seller/products 200 "My products" "" A
t POST /products 201 "Create product" '{"name":"NewProd","description":"Desc","price":9.99,"stock":10,"category_id":1}' A

PID=$(curl -s "$BASE/seller/products" -H "Authorization: Bearer $TOKEN" -H "$A" | python3 -c "
import sys,json;d=json.load(sys.stdin);dat=d.get('data',{})
p=dat.get('data',[]) if isinstance(dat,dict) and 'data' in dat else []
print(p[0]['id'] if p else '')
" 2>/dev/null)
[ -n "$PID" ] && t PUT "/products/$PID" 200 "Update product" '{"name":"Updated"}' A
[ -n "$PID" ] && t DELETE "/products/$PID" 200 "Delete product" "" A

# FK constraint test
t DELETE "/products/1" 409 "Delete w/ orders" "" A

# ═══ ADMIN (18) ═══
t GET /admin/dashboard 200 "Dashboard" "" A
t GET /admin/users 200 "Users" "" A
t GET /admin/orders 200 "Orders" "" A
t GET /admin/products 200 "Products" "" A
t GET /admin/payments 200 "Payments" "" A

TUID=$(curl -s "$BASE/admin/users" -H "Authorization: Bearer $TOKEN" -H "$A" | python3 -c "
import sys,json;d=json.load(sys.stdin);dat=d.get('data',{})
u=dat.get('data',[]) if isinstance(dat,dict) and 'data' in dat else []
print(next((str(x['id']) for x in u if x['id']!=1),''))
" 2>/dev/null)
[ -n "$TUID" ] && t PUT "/admin/users/$TUID/role" 200 "Change role" '{"role":"seller"}' A
[ -n "$TUID" ] && t PUT "/admin/users/$TUID/toggle" 200 "Toggle user" "" A
[ -n "$TUID" ] && t PUT "/admin/users/$TUID/toggle" 200 "Untoggle" "" A

t POST /admin/categories 201 "Create cat" '{"name":"TC99","slug":"tc-99"}' A
CATID=$(curl -s "$BASE/categories" -H "$A" | python3 -c "import sys,json;d=json.load(sys.stdin);c=d.get('data',[]);print(c[-1]['id'] if c else '')" 2>/dev/null)
[ -n "$CATID" ] && t PUT "/admin/categories/$CATID" 200 "Update cat" '{"name":"UC99"}' A
[ -n "$CATID" ] && t DELETE "/admin/categories/$CATID" 200 "Delete cat" "" A

t POST /admin/coupons 201 "Create coupon" '{"code":"CP99","discount":10,"type":"fixed","expires_at":"2027-12-31"}' A
CPID=$(curl -s "$BASE/admin/coupons" -H "Authorization: Bearer $TOKEN" -H "$A" | python3 -c "import sys,json;d=json.load(sys.stdin);c=d.get('data',[]);print(c[-1]['id'] if c else '')" 2>/dev/null)
[ -n "$CPID" ] && t GET "/admin/coupons/$CPID" 200 "Show coupon" "" A
[ -n "$CPID" ] && t PUT "/admin/coupons/$CPID" 200 "Update coupon" '{"discount":20}' A
[ -n "$CPID" ] && t DELETE "/admin/coupons/$CPID" 200 "Delete coupon" "" A

[ -n "$OID" ] && t PUT "/admin/orders/$OID/status" 200 "Admin order status" '{"status":"processing"}' A
t PUT /admin/products/1/toggle 200 "Toggle off" "" A
t PUT /admin/products/1/toggle 200 "Toggle on" "" A

# ═══ SECURITY (5) ═══
t GET /admin/dashboard 401 "No auth admin" "" ""
t POST /products 401 "No auth seller" "" ""
t GET /orders 401 "No auth orders" "" ""
[ -n "$BUYER_TOK" ] && t GET /admin/dashboard 403 "Buyer blocked admin" "" "B:$BUYER_TOK"
[ -n "$BUYER_TOK" ] && t POST /products 403 "Buyer blocked seller" '{"name":"x","description":"x","price":1,"stock":1,"category_id":1}' "B:$BUYER_TOK"

# ═══ REFRESH (last) ═══
t POST /auth/refresh 200 "Refresh token" "" A

# ═══ REPORT ═══
TOTAL=$((PASS+FAIL))
echo ""
echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║            RAPPORT FINAL — API E-COMMERCE                          ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""
echo "| Method | Route | Attendu | Réel | Statut | Description |"
echo "|--------|-------|---------|------|--------|-------------|"
echo -e "$RESULTS"
echo ""
echo "══════════════════════════════════════════"
printf "  TOTAL:      %d tests\n" $TOTAL
printf "  RÉUSSIS:    %d ✅\n" $PASS
printf "  ÉCHOUÉS:    %d ❌\n" $FAIL
[ $TOTAL -gt 0 ] && printf "  COUVERTURE: %d%%\n" $(( PASS * 100 / TOTAL ))
echo "══════════════════════════════════════════"

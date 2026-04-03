# ShopEZ Backend

## Run
1. Create MySQL database: `ecommerce`
2. Update `src/main/resources/application.properties` with your MySQL username/password
3. Run:
   - Windows: `mvnw spring-boot:run`
   - Or import as Maven project in Eclipse/STS and run `EcommerceApplication.java`

Backend runs on: `http://localhost:8082`

## API Summary
- `/auth/register`
- `/auth/login`
- `/admin/add`
- `/admin/edit/{id}`
- `/admin/delete/{id}`
- `/admin/users`
- `/admin/orders`
- `/admin/orders/{id}/status?status=APPROVED`
- `/user/products`
- `/user/cart`
- `/user/order/{userId}`
- `/user/orders/{userId}`

## Notes
- Product images are stored as Base64 text in the database.
- Orders are saved in `order_history` table with `PENDING`, `APPROVED`, or `REJECTED` status.

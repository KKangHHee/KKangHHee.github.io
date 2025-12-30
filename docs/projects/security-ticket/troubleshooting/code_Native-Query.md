### Native Query

```java
public interface UserRepository extends JpaRepository<User, Long> {
    @Query(value = """
        SELECT
            u.name AS userName,
            u.email AS userEmail,
            c.phone_number AS clientPhone,
            co.name AS companyName,
            co.business_number AS businessNumber
        FROM user u
        LEFT JOIN client c ON u.client_id = c.client_id
        LEFT JOIN company co ON c.company_id = co.company_id
        WHERE u.client_id IS NOT NULL
          AND (:keyword IS NULL
               OR (:range = 'companyName' AND co.name LIKE CONCAT('%', :keyword, '%')))
          AND (:startDate IS NULL OR u.last_login_at >= :startDate)
          AND (:endDate IS NULL OR u.last_login_at <= :endDate)
        ORDER BY u.last_login_at DESC
        """,
        nativeQuery = true)
    Page<ResponseClientDto> searchClients(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        @Param("range") String range,
        @Param("keyword") String keyword,
        Pageable pageable
    );
}
```

### JPA-Specification

```java
public class UserSpecification {
    public static Specification<User> filterClients(
            LocalDate startDate,
            LocalDate endDate,
            String range,
            String keyword) {

        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Client가 있는 User만 (회원만)
            predicates.add(criteriaBuilder.isNotNull(root.get("client")));

            // 날짜 필터
            if (startDate != null && endDate != null) {
                LocalDateTime startDateTime = startDate.atStartOfDay();
                LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay();
                predicates.add(criteriaBuilder.between(
                        root.get("lastLoginAt"),
                        startDateTime,
                        endDateTime
                ));
            }

            // 키워드 검색
            if (keyword != null && !keyword.isEmpty()) {
                if ("all".equals(range)) {
                    Predicate emailLike = criteriaBuilder.like(
                            root.get("email"), "%" + keyword + "%");
                    Predicate nameLike = criteriaBuilder.like(
                            root.get("name"), "%" + keyword + "%");
                    Predicate deptLike = criteriaBuilder.like(
                            root.get("department"), "%" + keyword + "%");

                    // Company name 검색을 위한 Join
                    Join<Object, Object> clientJoin = root.join("client");
                    Join<Object, Object> companyJoin = clientJoin.join("company");
                    Predicate companyLike = criteriaBuilder.like(
                            companyJoin.get("name"), "%" + keyword + "%");

                    predicates.add(criteriaBuilder.or(
                            emailLike, nameLike, deptLike, companyLike));

                } else if ("email".equals(range)) {
                    predicates.add(criteriaBuilder.like(
                            root.get("email"), "%" + keyword + "%"));
                } else if ("name".equals(range)) {
                    predicates.add(criteriaBuilder.like(
                            root.get("name"), "%" + keyword + "%"));
                } else if ("department".equals(range)) {
                    predicates.add(criteriaBuilder.like(
                            root.get("department"), "%" + keyword + "%"));
                } else if ("companyName".equals(range)) {
                    Join<Object, Object> clientJoin = root.join("client");
                    Join<Object, Object> companyJoin = clientJoin.join("company");
                    predicates.add(criteriaBuilder.like(
                            companyJoin.get("name"), "%" + keyword + "%"));
                }
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
```

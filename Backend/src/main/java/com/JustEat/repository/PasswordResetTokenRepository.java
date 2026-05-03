package com.JustEat.repository;

import com.JustEat.entity.PasswordResetToken;
import com.JustEat.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByTokenHash(String tokenHash);
    List<PasswordResetToken> findByUsedFalseAndExpiryDateAfter(LocalDateTime now);
    void deleteAllByUser(User user);
}
package back.domain.user.service;


import back.domain.enums.UserStatus;
import back.domain.exception.BusinessException;
import back.domain.exception.ErrorCode;
import back.domain.user.dto.UserPostDto;
import back.domain.user.entity.User;
import back.domain.user.repository.UserRepository;
import back.domain.utils.JwtAuthorityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import back.domain.course.entity.CourseLike;

import javax.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class UserService {
    @Value("${ADMIN_EMAIL}")
    private String adminEmail;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private final JwtAuthorityUtils jwtAuthorityUtils;

    public User post(User user, UserPostDto userPostDto) {
        // 이미 등록된 이메일인지 확인
        verifyExistEmail(user.getEmail());

        user.setEmail(userPostDto.getEmail());
        user.setName(userPostDto.getName());
        user.setUserImage("basic");
        user.setUserStatus(UserStatus.ACTIVITY);

        // password 암호화
        String encode = passwordEncoder.encode(user.getPassword());
        user.setPassword(encode);

        // DB에 User Role 저장
        List<String> roles = jwtAuthorityUtils.createRoles(user.getEmail());
        user.setRoles(roles);

        user.setLikeCount(0);
        User save = userRepository.save(user);

        return save;
    }
    public User get(Long userId) {
        User user = verifiedUser(userId);
        Integer count = user.getCourseLikes().stream()
                .map(CourseLike::getCourseLikeStatus)
                .mapToInt(i -> i)
                .sum();
        user.setLikeCount(count);
        return userRepository.save(user);
    }

    public List<User> gets() {
        return (List<User>) userRepository.findAll();
    }

    public User verifiedUser(Long userId) {
        Optional<User> findUser = userRepository.findById(userId);
        User user = findUser.orElseThrow( () -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        return user;
    }

    public User patch(User user, Long userId) {
        User findUser = verifiedUser(userId);

        Optional.ofNullable(user.getName())
                .ifPresent(name -> findUser.setName(name));
        Optional.ofNullable(user.getUserImage())
                .ifPresent(userImage -> findUser.setUserImage(userImage));
        Optional.ofNullable(user.getPassword())
                .ifPresent(password -> findUser.setPassword(password));

        findUser.setModifiedAt(LocalDateTime.now());

        return userRepository.save(findUser);
    }

    public void delete(Long userId) {
        User findUser = verifiedUser(userId);

        userRepository.delete(findUser);
    }

    private void verifyExistEmail(String email) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isPresent())
            throw new BusinessException(ErrorCode.USER_EMAIL_EXISTS);
    }
}

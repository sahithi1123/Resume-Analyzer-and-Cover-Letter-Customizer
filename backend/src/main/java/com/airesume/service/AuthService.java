package com.airesume.service;

import com.airesume.dto.AuthRequest;
import com.airesume.dto.AuthResponse;
import com.airesume.dto.RegisterRequest;
import com.airesume.dto.UserDto;
import com.airesume.entity.User;
import com.airesume.exception.BadRequestException;
import com.airesume.exception.ResourceNotFoundException;
import com.airesume.repository.UserRepository;
import com.airesume.security.JwtTokenProvider;
import com.airesume.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered. Please log in.");
        }

        User user = new User(
                request.getEmail().toLowerCase().trim(),
                passwordEncoder.encode(request.getPassword()),
                request.getFullName().trim()
        );

        User savedUser = userRepository.save(user);

        // Generate JWT token
        String token = tokenProvider.generateTokenFromEmail(savedUser.getEmail());
        UserDto userDto = new UserDto(savedUser.getId(), savedUser.getEmail(), savedUser.getFullName());

        return new AuthResponse(token, userDto);
    }

    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().toLowerCase().trim(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = tokenProvider.generateToken(authentication);
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        UserDto userDto = new UserDto(principal.getId(), principal.getUsername(), principal.getFullName());

        return new AuthResponse(token, userDto);
    }

    @Transactional(readOnly = true)
    public User getUserEntity(UserPrincipal principal) {
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + principal.getId()));
    }

    public UserDto getCurrentUserDto(UserPrincipal principal) {
        return new UserDto(principal.getId(), principal.getUsername(), principal.getFullName());
    }
}

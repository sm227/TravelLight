package org.example.travellight.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.example.travellight.dto.ReservationDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
@ConditionalOnProperty(name = "spring.mail.enabled", havingValue = "true", matchIfMissing = true)
public class EmailServiceImpl implements EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailServiceImpl.class);
    private final JavaMailSender mailSender;

    @Autowired
    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
        logger.info("EmailServiceImpl initialized with JavaMailSender: {}", mailSender.getClass().getName());
    }

    @Override
    public boolean sendReservationConfirmationEmail(ReservationDto reservationDto) {
        logger.info("Attempting to send email to: {}", reservationDto.getUserEmail());
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            // 수신자 설정
            helper.setTo(reservationDto.getUserEmail());
            // 제목 설정
            helper.setSubject("[TravelLight] 예약이 확인되었습니다");
            // 메일 내용 생성
            String emailContent = createReservationEmailContent(reservationDto);
            // HTML 형식으로 메일 내용 설정
            helper.setText(emailContent, true);
            
            // 메일 전송
            mailSender.send(message);
            logger.info("예약 확인 이메일이 {}에게 성공적으로 전송되었습니다.", reservationDto.getUserEmail());
            return true;
        } catch (MessagingException e) {
            logger.error("이메일 전송 중 오류가 발생했습니다: {}", e.getMessage(), e);
            return false;
        } catch (Exception e) {
            logger.error("예상치 못한 오류 발생: {}", e.getMessage(), e);
            return false;
        }
    }

    @Override
    public boolean sendPasswordResetVerificationEmail(String email, String verificationCode) {
        logger.info("비밀번호 재설정 인증 코드 이메일 전송 요청: {}", email);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            // 수신자 설정
            helper.setTo(email);
            // 제목 설정
            helper.setSubject("[TravelLight] 비밀번호 재설정 인증 코드");
            // 메일 내용 생성
            String emailContent = createPasswordResetEmailContent(verificationCode);
            // HTML 형식으로 메일 내용 설정
            helper.setText(emailContent, true);
            
            // 메일 전송
            mailSender.send(message);
            logger.info("비밀번호 재설정 인증 코드 이메일이 {}에게 성공적으로 전송되었습니다.", email);
            return true;
        } catch (MessagingException e) {
            logger.error("비밀번호 재설정 이메일 전송 중 오류가 발생했습니다: {}", e.getMessage(), e);
            return false;
        } catch (Exception e) {
            logger.error("예상치 못한 오류 발생: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * 비밀번호 재설정 인증 코드 이메일 내용을 생성합니다.
     * 
     * @param verificationCode 인증 코드
     * @return HTML 형식의 이메일 내용
     */
    private String createPasswordResetEmailContent(String verificationCode) {
        StringBuilder emailBuilder = new StringBuilder();
        emailBuilder.append("<html><body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>");
        emailBuilder.append("<div style='background-color: #4a90e2; color: white; padding: 20px; text-align: center;'>");
        emailBuilder.append("<h1>TravelLight 비밀번호 재설정</h1>");
        emailBuilder.append("</div>");
        
        emailBuilder.append("<div style='padding: 20px;'>");
        emailBuilder.append("<p>안녕하세요,</p>");
        emailBuilder.append("<p>TravelLight 계정의 비밀번호 재설정을 요청하셨습니다.</p>");
        emailBuilder.append("<p>아래의 6자리 인증 코드를 입력하여 비밀번호 재설정을 완료해주세요.</p>");
        
        emailBuilder.append("<div style='background-color: #f7f7f7; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;'>");
        emailBuilder.append("<h2 style='color: #4a90e2; font-size: 32px; letter-spacing: 5px; margin: 10px 0;'>")
                .append(verificationCode).append("</h2>");
        emailBuilder.append("<p style='color: #666; font-size: 14px;'>인증 코드는 5분간 유효합니다.</p>");
        emailBuilder.append("</div>");
        
        emailBuilder.append("<p style='color: #999; font-size: 14px;'>만약 비밀번호 재설정을 요청하지 않으셨다면, 이 이메일을 무시하셔도 됩니다.</p>");
        emailBuilder.append("<p>감사합니다.<br>TravelLight 팀</p>");
        emailBuilder.append("</div>");
        
        emailBuilder.append("<div style='background-color: #f2f2f2; padding: 15px; text-align: center; font-size: 12px;'>");
        emailBuilder.append("<p>© 2023 TravelLight. All rights reserved.</p>");
        emailBuilder.append("<p>이 이메일은 자동으로 발송되었습니다. 회신하지 마시기 바랍니다.</p>");
        emailBuilder.append("</div>");
        emailBuilder.append("</body></html>");
        
        return emailBuilder.toString();
    }

    /**
     * 예약 확인 이메일 내용을 생성합니다.
     * 
     * @param reservationDto 예약 정보
     * @return HTML 형식의 이메일 내용
     */
    private String createReservationEmailContent(ReservationDto reservationDto) {
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy년 MM월 dd일");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
        
        StringBuilder emailBuilder = new StringBuilder();
        emailBuilder.append("<html><body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>");
        emailBuilder.append("<div style='background-color: #4a90e2; color: white; padding: 20px; text-align: center;'>");
        emailBuilder.append("<h1>TravelLight 예약 확인</h1>");
        emailBuilder.append("</div>");
        
        emailBuilder.append("<div style='padding: 20px;'>");
        emailBuilder.append("<p>안녕하세요, <strong>").append(reservationDto.getUserName()).append("</strong>님,</p>");
        emailBuilder.append("<p>TravelLight 서비스를 이용해 주셔서 감사합니다. 귀하의 예약이 확인되었습니다.</p>");
        
        emailBuilder.append("<div style='background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 20px 0;'>");
        emailBuilder.append("<h2 style='color: #4a90e2;'>예약 정보</h2>");
        emailBuilder.append("<table style='width: 100%;'>");
        emailBuilder.append("<tr><td style='padding: 5px 0; font-weight: bold;'>예약 번호:</td><td>").append(reservationDto.getReservationNumber()).append("</td></tr>");
        emailBuilder.append("<tr><td style='padding: 5px 0; font-weight: bold;'>보관 장소:</td><td>").append(reservationDto.getPlaceName()).append("</td></tr>");
        emailBuilder.append("<tr><td style='padding: 5px 0; font-weight: bold;'>주소:</td><td>").append(reservationDto.getPlaceAddress()).append("</td></tr>");
        
        if ("day".equals(reservationDto.getStorageType())) {
            emailBuilder.append("<tr><td style='padding: 5px 0; font-weight: bold;'>보관 날짜:</td><td>")
                    .append(reservationDto.getStorageDate().format(dateFormatter)).append("</td></tr>");
        } else {
            emailBuilder.append("<tr><td style='padding: 5px 0; font-weight: bold;'>보관 기간:</td><td>")
                    .append(reservationDto.getStorageDate().format(dateFormatter))
                    .append(" ~ ")
                    .append(reservationDto.getStorageEndDate().format(dateFormatter))
                    .append("</td></tr>");
        }
        
        emailBuilder.append("<tr><td style='padding: 5px 0; font-weight: bold;'>이용 시간:</td><td>")
                .append(reservationDto.getStorageStartTime().format(timeFormatter))
                .append(" ~ ")
                .append(reservationDto.getStorageEndTime().format(timeFormatter))
                .append("</td></tr>");
        
        // 가방 정보
        emailBuilder.append("<tr><td colspan='2' style='padding: 10px 0; font-weight: bold;'>보관 가방:</td></tr>");
        if (reservationDto.getSmallBags() != null && reservationDto.getSmallBags() > 0) {
            emailBuilder.append("<tr><td style='padding: 5px 0;'>소형 가방:</td><td>").append(reservationDto.getSmallBags()).append("개</td></tr>");
        }
        if (reservationDto.getMediumBags() != null && reservationDto.getMediumBags() > 0) {
            emailBuilder.append("<tr><td style='padding: 5px 0;'>중형 가방:</td><td>").append(reservationDto.getMediumBags()).append("개</td></tr>");
        }
        if (reservationDto.getLargeBags() != null && reservationDto.getLargeBags() > 0) {
            emailBuilder.append("<tr><td style='padding: 5px 0;'>대형 가방:</td><td>").append(reservationDto.getLargeBags()).append("개</td></tr>");
        }
        
        emailBuilder.append("<tr><td style='padding: 5px 0; font-weight: bold;'>결제 금액:</td><td>").append(reservationDto.getTotalPrice()).append("원</td></tr>");
        emailBuilder.append("</table>");
        emailBuilder.append("</div>");
        
        emailBuilder.append("<p>예약 취소나 변경이 필요하신 경우, 웹사이트에서 예약번호를 입력하시거나 고객센터로 문의해 주세요.</p>");
        emailBuilder.append("<p>감사합니다.<br>TravelLight 팀</p>");
        emailBuilder.append("</div>");
        
        emailBuilder.append("<div style='background-color: #f2f2f2; padding: 15px; text-align: center; font-size: 12px;'>");
        emailBuilder.append("<p>© 2023 TravelLight. All rights reserved.</p>");
        emailBuilder.append("<p>이 이메일은 자동으로 발송되었습니다. 회신하지 마시기 바랍니다.</p>");
        emailBuilder.append("</div>");
        emailBuilder.append("</body></html>");
        
        return emailBuilder.toString();
    }
} 
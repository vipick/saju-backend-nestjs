import * as CommonConvert from '../commons/saju/birth-to-saju';
import * as CommonFormat from '../commons/saju/format';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SigninRequestDto, SignupRequestDto } from './dto/user.request.dto';
import { AccessTokenDto } from './dto/user.response.dto';
import { MeDto } from './dto/user.response.dto';
import { User } from '../entities/user.entity';
import { Member } from '../entities/member.entity';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { MemberManse } from 'src/entities/member-manse.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    private jwtService: JwtService,
  ) {}

  /**
   * 회원가입
   * @param signupRequestDto
   * @returns AccessTokenDto
   */
  async signUp(signupRequestDto: SignupRequestDto): Promise<AccessTokenDto> {
    const { email, password, birthdayType, birthday, gender, time, nickname } =
      signupRequestDto;
    const birthday2 = await String(birthday).replace(
      /(\d{4})(\d{2})(\d{2})/g,
      '$1-$2-$3',
    );
    const time2 = time
      ? await String(time).replace(/(\d{2})(\d{2})/g, '$1:$2')
      : null;
    try {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);
      const duplicatedUser = await this.userRepository.findOne({ email });

      if (duplicatedUser) {
        throw new ConflictException();
      }

      const user = await this.userRepository.insert({
        email,
        password: hashedPassword,
      });

      const userId = user.identifiers[0].id;

      const member = await this.memberRepository.insert({
        userId,
        type: 'USER',
        nickname,
        gender,
        birthdayType,
        birthday: birthday2,
        time: time2,
      });

      const memberId = member.identifiers[0].id;
      const memberDto = {
        nickname,
        gender,
        birthdayType,
        birthday: birthday2,
        time: time2,
      };
      //만세력 변환
      const memberManse = await CommonConvert.convertBirthtimeToSaju(
        memberId,
        memberDto,
      );

      //멤버 만세력 추가
      await MemberManse.insert(memberManse);

      const payload = { email };
      const accessToken = await this.jwtService.sign(payload);

      return { accessToken };
    } catch (error) {
      if (error.status === 409) {
        throw new HttpException(
          '이미 사용중인 이메일 입니다.',
          HttpStatus.CONFLICT,
        );
      } else {
        console.log(error);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  /**
   * 로그인
   * @param signinRequestDto
   * @returns AccessTokenDto
   */
  async signIn(signinRequestDto: SigninRequestDto): Promise<AccessTokenDto> {
    const { email, password } = signinRequestDto;

    try {
      const user = await this.userRepository.findOne({ email });
      if (user && (await bcrypt.compare(password, user.password))) {
        //User 토큰 생성 (Secret + Payload)
        const payload = { email };
        const accessToken = await this.jwtService.sign(payload);

        return { accessToken };
      } else {
        throw new UnauthorizedException();
      }
    } catch (error) {
      if (error.status === 401) {
        throw new HttpException('로그인 실패', HttpStatus.UNAUTHORIZED);
      } else {
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  /**
   * 내 정보보기
   * @param user
   * @returns MeDto
   */
  async me(user: User): Promise<MeDto> {
    try {
      const member = await this.memberRepository.find({
        where: { userId: user.id, type: 'USER' },
        relations: ['memberManse'],
        order: {
          createdAt: 'DESC',
        },
      });

      const member2 = member[0];
      const manse = member[0].memberManse;
      delete member2.memberManse;

      const me = await CommonFormat.convertMemberToSaju(member2, manse);

      return {
        member: me['member'],
        saju: me['saju'],
        fortune: me['fortune'],
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/user.entity';
import { Cart } from '../cart/cart.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Cart) private cartRepo: Repository<Cart>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.userRepo.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email đã được sử dụng');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({ ...dto, password: hashed });
    await this.userRepo.save(user);

    // auto create cart
    const cart = this.cartRepo.create({ user });
    await this.cartRepo.save(cart);

    return this.buildResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    const match = await bcrypt.compare(dto.password, user.password);
    if (!match) throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    return this.buildResponse(user);
  }

  async refreshToken(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Người dùng không tồn tại');
    return this.buildResponse(user);
  }

  async logout(userId: string) {
    await this.userRepo.update(userId, { refreshToken: null });
    return { success: true, message: 'Đăng xuất thành công' };
  }

  private buildResponse(user: User) {
    const { password, refreshToken, ...userData } = user as any;
    const accessToken = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });
    const refreshToken_ = this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      { secret: process.env.JWT_SECRET || 'apple-store-secret-key', expiresIn: '30d' },
    );
    // Store hashed RT in DB
    this.userRepo.update(user.id, { refreshToken: refreshToken_ });
    return { data: { user: userData, accessToken, refreshToken: refreshToken_ }, success: true, message: 'Thành công' };
  }
}

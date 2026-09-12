import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';

import { AuthenticationService } from '../../../../core/authentication/authentication.service';
import { APP_VERSION } from '../../../../core/config/app-version';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    NgIf,
    TranslateModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private auth = inject(AuthenticationService);
  private router = inject(Router);

  readonly appVersion = APP_VERSION;

  logging = false;
  errorMessage = '';

  email = new FormControl<string>('', {
    nonNullable: true
  });

  password = new FormControl<string>('', {
    nonNullable: true
  });

  async login(): Promise<void> {
    event?.preventDefault();
    this.errorMessage = '';

    const email = this.email.value.trim();
    const password = this.password.value;

    if (!email || !password) {
      this.errorMessage = 'Informe o e-mail e a senha.';
      return;
    }

    this.logging = true;

    try {
      await this.auth.login(email, password);
      await this.router.navigate(['/dashboard']);
    } catch (error: any) {
      console.error('Login failed', error);

      this.errorMessage = this.getErrorMessage(error);
    } finally {
      this.logging = false;
    }
  }

  private getErrorMessage(error: any): string {
    switch (error?.code) {
      case 'auth/invalid-credential':
        return 'E-mail ou senha inválidos.';

      case 'auth/user-not-found':
        return 'Usuário não encontrado.';

      case 'auth/wrong-password':
        return 'Senha inválida.';

      case 'auth/invalid-email':
        return 'E-mail inválido.';

      case 'auth/too-many_requests':
        return 'Muitas tentativas. Tente novamente mais tarde.';

      default:
        return 'Não foi possível realizar o login. Tente novamente.';
    }
  }
}

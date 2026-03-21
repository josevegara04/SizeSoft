import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ApiService } from '../services/api.service';

export const authGuard: CanActivateFn = () => {
    const apiService = inject(ApiService);
    const router = inject(Router);

    if (apiService.lboolUserLogged) {
        return true;
    }

    router.navigate(['/login']);
    return false;
};
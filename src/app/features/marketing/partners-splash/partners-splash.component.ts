import { Component, EventEmitter, Output } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { Partner, PLATINUM_PARTNERS, GOLD_PARTNERS, SILVER_PARTNERS, partnerSiteUrl } from '../data/partners.mock';

/**
 * Fullscreen partners screen shown once per session, right after login,
 * before the rest of the app is rendered. See AppComponent for the
 * show/hide + "once per session" logic.
 *
 * Partners are grouped by tier (platinum / gold / silver) purely through
 * visual treatment (size, presence of name/text) - no section labels are
 * rendered, per product requirement.
 */
@Component({
  selector: 'app-partners-splash',
  standalone: true,
  imports: [NgFor, NgIf, MatIconModule, MatButtonModule, TranslateModule],
  templateUrl: './partners-splash.component.html',
  styleUrl: './partners-splash.component.scss'
})
export class PartnersSplashComponent {
  @Output() closed = new EventEmitter<void>();

  platinumPartners: Partner[] = PLATINUM_PARTNERS;
  goldPartners: Partner[] = GOLD_PARTNERS;
  silverPartners: Partner[] = SILVER_PARTNERS;

  siteUrl(partner: Partner): string {
    return partnerSiteUrl(partner);
  }

  initials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(word => word[0]?.toUpperCase())
      .join('');
  }

  close(): void {
    this.closed.emit();
  }
}

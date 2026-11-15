import { REGION_NAMES } from '../../utils/labels.js';
import { asset } from '../../utils/asset.js';

/** Бейдж регіону — вміст <dd>: значок (колір — не єдина ознака) і назва. */
export default function RegionBadge({ region }) {
  return (
    <dd className={`badge-region badge-region--${region}`}>
      <img className="badge-region__icon" src={asset(`assets/region-${region}.svg`)} alt="" width="18" height="18" /> {REGION_NAMES[region]}
    </dd>
  );
}

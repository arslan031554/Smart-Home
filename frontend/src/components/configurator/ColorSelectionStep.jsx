import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Palette, CheckCircle2, Sparkles } from 'lucide-react';
import { Card, SectionTitle, Badge, Alert } from '../common/UIComponents';
import { useTranslation } from 'react-i18next';
import { setColor } from '../../features/configurator/configuratorSlice';

const COLOR_NAME_TO_HEX = {
    black: '#111827',
    anthracite: '#666666',
    graphite: '#3d4451',
    charcoal: '#36454f',
    gray: '#6b7280',
    grey: '#6b7280',
    silver: '#c0c0c0',
    aluminium: '#b8bec7',
    aluminum: '#b8bec7',
    white: '#f8fafc',
    ivory: '#fff8e7',
    beige: '#d6c2a1',
    cream: '#f7e7ce',
    blue: '#2563eb',
    navy: '#1e3a8a',
    green: '#15803d',
    red: '#b91c1c',
    bronze: '#8b6b4a',
    copper: '#b87333',
    gold: '#b8860b',
};

function normalizeHex(value) {
    const raw = String(value || '').trim();
    if (!raw) return null;

    if (/^#([0-9a-fA-F]{6})$/.test(raw)) return raw.toUpperCase();
    if (/^#([0-9a-fA-F]{3})$/.test(raw)) {
        const short = raw.slice(1);
        return `#${short[0]}${short[0]}${short[1]}${short[1]}${short[2]}${short[2]}`.toUpperCase();
    }

    return null;
}

function hexToRgb(hex) {
    const normalized = normalizeHex(hex);
    if (!normalized) return { r: 120, g: 120, b: 120 };

    const intVal = parseInt(normalized.slice(1), 16);
    return {
        r: (intVal >> 16) & 255,
        g: (intVal >> 8) & 255,
        b: intVal & 255,
    };
}

function rgbToHex(r, g, b) {
    const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
    return `#${[clamp(r), clamp(g), clamp(b)].map((n) => n.toString(16).padStart(2, '0')).join('')}`.toUpperCase();
}

function mixHex(hexA, hexB, ratio) {
    const a = hexToRgb(hexA);
    const b = hexToRgb(hexB);
    const t = Math.max(0, Math.min(1, ratio));
    return rgbToHex(
        a.r + (b.r - a.r) * t,
        a.g + (b.g - a.g) * t,
        a.b + (b.b - a.b) * t,
    );
}

function inferColorHex(color) {
    const fromHex = normalizeHex(color?.hex);
    if (fromHex) return fromHex;

    const name = String(color?.name || '').toLowerCase();
    for (const [token, hex] of Object.entries(COLOR_NAME_TO_HEX)) {
        if (name.includes(token)) return hex;
    }

    return '#64748B';
}

function createColorSwatchImage(colorHex, colorName = 'COLOR') {
    const topTone = mixHex(colorHex, '#FFFFFF', 0.22);
    const bottomTone = mixHex(colorHex, '#000000', 0.3);
    const accentTone = mixHex(colorHex, '#FFFFFF', 0.45);
    const label = String(colorName || 'COLOR').toUpperCase();

    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="base" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${topTone}" />
      <stop offset="100%" stop-color="${bottomTone}" />
    </linearGradient>
    <radialGradient id="glow" cx="0.22" cy="0.18" r="0.52">
      <stop offset="0%" stop-color="${accentTone}" stop-opacity="0.7" />
      <stop offset="100%" stop-color="${bottomTone}" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#base)" />
  <rect width="1200" height="800" fill="url(#glow)" />
  <rect x="60" y="560" width="1080" height="180" rx="28" fill="#FFFFFF" fill-opacity="0.08" />
  <text x="95" y="650" fill="#FFFFFF" fill-opacity="0.92" font-size="54" font-family="Arial, sans-serif" font-weight="700">${label}</text>
</svg>`.trim();

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function createSolidColorImage(colorHex) {
    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <rect width="1200" height="800" fill="${colorHex}" />
</svg>`.trim();

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function createAluminiumImage() {
    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="aluBase" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#E4E4E4" />
      <stop offset="24%" stop-color="#D5D5D5" />
      <stop offset="56%" stop-color="#C9C9C9" />
      <stop offset="100%" stop-color="#BFBFBF" />
    </linearGradient>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
      <feComponentTransfer>
        <feFuncA type="table" tableValues="0 0.07" />
      </feComponentTransfer>
    </filter>
  </defs>
  <rect width="1200" height="800" fill="url(#aluBase)" />
  <rect width="1200" height="800" filter="url(#grain)" />
  <rect y="78" width="1200" height="68" fill="#F2F2F2" fill-opacity="0.2" />
  <rect y="0" width="1200" height="44" fill="#8A8A8A" fill-opacity="0.13" />
  <g stroke="#9A9A9A" stroke-opacity="0.28">
    <line x1="0" y1="260" x2="1200" y2="260" />
    <line x1="0" y1="410" x2="1200" y2="410" />
    <line x1="0" y1="560" x2="1200" y2="560" />
  </g>
</svg>`.trim();

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function createWhiteImage() {
    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="whiteBase" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FCFCFC" />
      <stop offset="100%" stop-color="#ECECEC" />
    </linearGradient>
    <filter id="whiteGrain">
      <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="2" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
      <feComponentTransfer>
        <feFuncA type="table" tableValues="0 0.06" />
      </feComponentTransfer>
    </filter>
  </defs>
  <rect width="1200" height="800" fill="url(#whiteBase)" />
  <rect width="1200" height="800" filter="url(#whiteGrain)" />
  <g stroke="#D4D4D4" stroke-opacity="0.22" stroke-width="2">
    <line x1="120" y1="90" x2="600" y2="330" />
    <line x1="620" y1="240" x2="1090" y2="470" />
    <line x1="540" y1="390" x2="980" y2="640" />
  </g>
</svg>`.trim();

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function isBlackColorTone(color, inferredHex) {
    const name = String(color?.name || '').toLowerCase();
    if (name.includes('black')) return true;

    const { r, g, b } = hexToRgb(inferredHex);
    return r <= 30 && g <= 30 && b <= 30;
}

function isAnthraciteTone(color) {
    const name = String(color?.name || '').toLowerCase();
    return name.includes('anthracite');
}

function isAluminiumTone(color) {
    const name = String(color?.name || '').toLowerCase();
    return name.includes('aluminium') || name.includes('aluminum');
}

function isSilverTone(color) {
    const name = String(color?.name || '').toLowerCase();
    return name.includes('silver');
}

function isWhiteTone(color) {
    const name = String(color?.name || '').toLowerCase();
    return name.includes('white');
}

function getColorFallbackImage(color, index) {
    if (isWhiteTone(color)) {
        return createWhiteImage();
    }
    if (isSilverTone(color)) {
        return createSolidColorImage('#A5A5A5');
    }
    if (isAluminiumTone(color)) {
        return createAluminiumImage();
    }
    if (isAnthraciteTone(color)) {
        return createSolidColorImage('#666666');
    }
    const inferred = inferColorHex(color);
    if (isBlackColorTone(color, inferred)) {
        return createSolidColorImage('#000000');
    }
    const name = color?.name || `Color ${index + 1}`;
    return createColorSwatchImage(inferred, name);
}

export default function ColorSelectionStep() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { color: selectedColorId, range: selectedRangeId } = useSelector((state) => state.configurator);
    const COLORS = useSelector((state) => state.admin.publicColors) || [];
    const availableColors = COLORS.filter((color) => {
        if (color?.isVisible === false || color?.isActive === false) return false;
        const assignedRanges = Array.isArray(color?.productRanges) ? color.productRanges : [];
        if (!selectedRangeId) return assignedRanges.length > 0;
        return assignedRanges.includes(selectedRangeId);
    });

    if (!Array.isArray(COLORS) || COLORS.length === 0) {
        return (
            <div className="space-y-6 animate-fade-in pb-16 max-w-7xl mx-auto sm:space-y-8 sm:pb-20">
                <SectionTitle
                    title={t('configurator.color.title', { defaultValue: 'Choose Color' })}
                    subtitle={t('configurator.color.loading', { defaultValue: 'Loading available colors...' })}
                    badge={t('configurator.color.badge', { defaultValue: 'Step 05: Color' })}
                />
                <Alert variant="info" className="p-6 rounded-2xl">
                    {t('configurator.color.loadingHelp', { defaultValue: 'Colors are loading. If this persists, please refresh the page.' })}
                </Alert>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pb-16 max-w-7xl mx-auto sm:space-y-8 sm:pb-20">
            <SectionTitle
                title={t('configurator.color.title', { defaultValue: 'Choose Color' })}
                subtitle={t('configurator.color.subtitle', { defaultValue: 'Select the color for your project. It is used as a compatibility filter where applicable.' })}
                badge={t('configurator.color.badge', { defaultValue: 'Step 05: Color' })}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {availableColors.map((color, index) => {
                    const isActive = selectedColorId === color.id;
                    const inferredHex = inferColorHex(color);
                    const fallbackImage = getColorFallbackImage(color, index);
                    const colorLabel = normalizeHex(color.hex) || inferredHex;
                    const featureChips = [
                        `HEX ${colorLabel}`,
                        t('configurator.color.finishProfile', { defaultValue: 'Finish Profile' }),
                        t('configurator.color.filterActive', { defaultValue: 'Color Filter Active' }),
                    ];

                    return (
                        <Card
                            key={color.id}
                            className={`group relative overflow-hidden transition-all duration-500 cursor-pointer border rounded-[1.25rem] sm:rounded-[1.5rem] ${isActive
                                ? 'border-primary-600 ring-8 ring-primary-600/5 bg-white'
                                : 'border-slate-100 hover:border-primary-200 bg-white'
                                } !shadow-none hover:!shadow-none`}
                            onClick={() => dispatch(setColor(color.id))}
                        >
                            {/* Color Visualization */}
                            <div className="h-64 overflow-hidden relative">
                                <img
                                    src={color.imageUrl || color.image || fallbackImage}
                                    alt={color.name}
                                    className={`w-full h-full object-cover transition-transform duration-1000 ${isActive ? 'scale-105' : 'group-hover:scale-105 brightness-95 group-hover:brightness-100'}`}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

                                {isActive && (
                                    <div className="absolute top-6 left-6 w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-xl animate-in fade-in zoom-in duration-300">
                                        <CheckCircle2 className="w-7 h-7" />
                                    </div>
                                )}

                                <div className="absolute bottom-6 left-8 right-8">
                                    <h3 className="text-xl font-bold text-white tracking-tight leading-tight uppercase">
                                        {color.name}
                                    </h3>
                                    <div className="mt-2 flex items-center gap-2">
                                        <div
                                            className="h-4 w-4 rounded-full border border-white/75"
                                            style={{ backgroundColor: colorLabel }}
                                        />
                                        <Badge className="bg-white/20 backdrop-blur-md border-none text-[8px] font-bold text-white uppercase tracking-[0.2em] px-3 py-1">
                                            {colorLabel}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 p-5 sm:p-6 sm:space-y-5">
                                <p className="text-sm font-medium text-slate-500 leading-relaxed line-clamp-3">
                                    {color.description || ''}
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    {featureChips.map((chip) => (
                                        <div key={chip} className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-1.5 text-[10px] font-bold text-slate-500">
                                            <Sparkles className="h-3 w-3 text-primary-400" />
                                            {chip}
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-2">
                                    <div className="h-1.5 w-full rounded-full bg-slate-100 relative overflow-hidden">
                                        <div
                                            className={`absolute inset-0 bg-primary-600 transition-all duration-700 ${isActive ? 'translate-x-0' : '-translate-x-full group-hover:translate-x-0'}`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            <Alert
                variant="info"
                className="mt-8 rounded-[1.25rem] border border-emerald-700/35 bg-gradient-to-r from-[#052e16] via-[#064e3b] to-[#052e16] p-6 text-white shadow-xl relative overflow-hidden group sm:rounded-[1.5rem] sm:p-8 [&>svg]:text-white"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full -mr-32 -mt-32 blur-[80px] opacity-40" />
                <div className="relative z-10 flex items-start gap-6">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl text-white flex items-center justify-center shadow-inner border border-white/15">
                        <Palette className="w-7 h-7" />
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-lg font-bold leading-none text-white">{t('configurator.color.projectLevelTitle', { defaultValue: 'Project-level color' })}</h4>
                        <p className="text-sm font-medium text-white leading-relaxed max-w-3xl">
                            {t('configurator.color.projectLevelHelp', { defaultValue: 'The selected color applies to your whole project and filters compatible products while keeping a cohesive finish profile across the installation.' })}
                        </p>
                    </div>
                </div>
            </Alert>

            <SectionTitle
                title={t('configurator.color.projectWideTitle', { defaultValue: 'A consistent finish across compatible devices.' })}
                subtitle={t('configurator.color.projectWideSubtitle', { defaultValue: 'The selected colour is used as a compatibility filter for the project. Products that do not support the chosen finish are clearly identified before the offer is generated.' })}
                badge={t('configurator.color.projectWideBadge', { defaultValue: 'PROJECT-WIDE FINISH SELECTION' })}
            />

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.15rem] border border-slate-200 bg-white/95 p-4 text-center shadow-sm">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-sm font-black text-emerald-700">1</div>
                    <h4 className="mt-3 text-sm font-black uppercase tracking-[0.18em] text-slate-900">{t('configurator.color.stepOneTitle', { defaultValue: 'Applied project-wide' })}</h4>
                    <p className="mt-2 text-xs leading-relaxed text-slate-500">{t('configurator.color.stepOneDescription', { defaultValue: 'Keep switches, panels and visible devices visually consistent.' })}</p>
                </div>
                <div className="rounded-[1.15rem] border border-slate-200 bg-white/95 p-4 text-center shadow-sm">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-sm font-black text-emerald-700">2</div>
                    <h4 className="mt-3 text-sm font-black uppercase tracking-[0.18em] text-slate-900">{t('configurator.color.stepTwoTitle', { defaultValue: 'Compatibility checked' })}</h4>
                    <p className="mt-2 text-xs leading-relaxed text-slate-500">{t('configurator.color.stepTwoDescription', { defaultValue: 'The configurator validates finish availability for every selected product.' })}</p>
                </div>
                <div className="rounded-[1.15rem] border border-slate-200 bg-white/95 p-4 text-center shadow-sm">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-sm font-black text-emerald-700">3</div>
                    <h4 className="mt-3 text-sm font-black uppercase tracking-[0.18em] text-slate-900">{t('configurator.color.stepThreeTitle', { defaultValue: 'Review before final offer' })}</h4>
                    <p className="mt-2 text-xs leading-relaxed text-slate-500">{t('configurator.color.stepThreeDescription', { defaultValue: 'Confirm the finish in the summary and change it without losing the project.' })}</p>
                </div>
            </div>
        </div>
    );
}

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addRoomToLevel, removeRoomFromLevel, updateRoom } from '../../features/configurator/configuratorSlice';
import { Plus, Trash2, Layers, Info, ChevronDown, ChevronUp, Home, Copy } from 'lucide-react';
import { clsx } from 'clsx';
import { Button, Card, SectionTitle, Badge } from '../common/UIComponents';
import { normalizeRoomCount } from '../../utils/configuratorNormalization';
import { useTranslation } from 'react-i18next';

const RoomCard = React.memo(({ room, idx, levelId, roomTypes, onRemove, onUpdate }) => {
    const { t } = useTranslation();
    const effectiveRoomCount = normalizeRoomCount(room.roomCount ?? room.count);
    const [localRoomCount, setLocalRoomCount] = useState(effectiveRoomCount);

    React.useEffect(() => {
        setLocalRoomCount(effectiveRoomCount);
    }, [effectiveRoomCount]);

    const handleBlurRoomCount = () => {
        const safe = normalizeRoomCount(localRoomCount);
        setLocalRoomCount(safe);
        if (safe !== effectiveRoomCount) onUpdate(levelId, room.id, { roomCount: safe });
    };

    const selectedType = roomTypes.find((type) => type.id === room.type);

    const handleTypeChange = (event) => {
        const typeId = event.target.value;
        const newType = roomTypes.find((type) => type.id === typeId);
        onUpdate(levelId, room.id, { type: typeId, name: newType?.name || room.name, functions: [] });
    };

    return (
        <div className="rounded-[1.7rem] border border-[#E5E7EB] bg-white p-5 shadow-soft transition-all duration-300 hover:border-primary-300 hover:bg-white/50">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary-200 bg-primary-50 text-sm font-semibold text-primary-700">
                        {(idx + 1).toString().padStart(2, '0')}
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('configurator.roomsLevels.roomCard.title')}</p>
                        <p className="mt-1 text-sm font-medium text-textPrimary">{selectedType?.name || t('configurator.roomsLevels.roomCard.unset')}</p>
                    </div>
                </div>
                <button
                    onClick={onRemove}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-textSecondary transition-all hover:border-red-500/18 hover:bg-red-500/10 hover:text-red-200"
                    title={t('configurator.roomsLevels.roomCard.removeRoom')}
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>

            <div className="mt-5 space-y-4">
                <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-textSecondary">{t('configurator.roomsLevels.roomCard.roomType')}</label>
                    <select
                        value={room.type}
                        onChange={handleTypeChange}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-textPrimary outline-none transition-all focus:border-primary-700 focus:ring-4 focus:ring-primary-500/10"
                    >
                        {roomTypes.map((type) => (
                            <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-textSecondary">{t('configurator.roomsLevels.roomCard.identicalRooms')}</label>
                    <div className="flex items-center gap-3">
                        <input
                            type="number"
                            min="1"
                            max="100"
                            value={localRoomCount}
                            onChange={(event) => setLocalRoomCount(event.target.value)}
                            onBlur={handleBlurRoomCount}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-textPrimary outline-none transition-all focus:border-primary-700 focus:ring-4 focus:ring-primary-500/10"
                        />
                        {normalizeRoomCount(localRoomCount) > 1 ? (
                            <Badge variant="info" className="whitespace-nowrap px-2.5 py-1 text-[9px]">x {normalizeRoomCount(localRoomCount)}</Badge>
                        ) : null}
                    </div>
                    {normalizeRoomCount(localRoomCount) > 1 ? (
                        <p className="mt-1 flex items-center gap-1 text-[11px] text-textSecondary">
                            <Copy className="h-3 w-3" />
                            {t('configurator.roomsLevels.roomCard.identicalRoomsHelper', { count: normalizeRoomCount(localRoomCount) })}
                        </p>
                    ) : null}
                </div>
            </div>
        </div>
    );
});
RoomCard.displayName = 'RoomCard';

function isRoomTypeAllowedForBuilding(type, buildingTypeId, hasAnyMappedRoomTypes) {
    if (!buildingTypeId) return true;
    if (!hasAnyMappedRoomTypes) return true;
    const buildingTypes = Array.isArray(type.buildingTypes) ? type.buildingTypes : [];
    return buildingTypes.some((buildingType) => (typeof buildingType === 'object' && buildingType?.id ? buildingType.id : buildingType) === buildingTypeId);
}

export default function RoomsLevelsStep() {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { levels, projectInfo } = useSelector((state) => state.configurator);
    const allRoomTypes = useSelector((state) => state.admin.roomTypes) || [];
    const [expandedLevel, setExpandedLevel] = useState(1);

    const roomTypesWithMappings = allRoomTypes.filter((type) => Array.isArray(type.buildingTypes) && type.buildingTypes.length > 0);
    const hasAnyMappedRoomTypes = roomTypesWithMappings.length > 0;
    const filteredRoomTypes = allRoomTypes.filter((type) => isRoomTypeAllowedForBuilding(type, projectInfo.buildingType, hasAnyMappedRoomTypes));
    const effectiveRoomTypes = projectInfo.buildingType ? filteredRoomTypes : allRoomTypes;
    const noRoomTypesForBuilding = Boolean(projectInfo.buildingType) && hasAnyMappedRoomTypes && effectiveRoomTypes.length === 0;

    const handleAddRoom = (levelId) => {
        if (noRoomTypesForBuilding || effectiveRoomTypes.length === 0) return;
        const defaultType = effectiveRoomTypes[0]?.id || '';
        dispatch(addRoomToLevel({
            levelId,
            room: {
                type: defaultType,
                name: effectiveRoomTypes[0]?.name || t('configurator.roomsLevels.roomCard.newRoomName'),
                roomCount: 1,
            },
        }));
    };

    const handleRoomUpdate = (levelId, roomId, data) => {
        dispatch(updateRoom({ levelId, roomId, data }));
    };

    const handleRemoveRoom = (levelId, roomId) => {
        dispatch(removeRoomFromLevel({ levelId, roomId }));
    };

    const totalRooms = levels.reduce((acc, level) => acc + level.rooms.length, 0);
    const totalInstances = levels.reduce((acc, level) =>
        acc + level.rooms.reduce((roomAcc, room) => roomAcc + normalizeRoomCount(room.roomCount ?? room.count), 0), 0);

    const getLevelLabel = (level) => {
        if (level.id === 1) return t('configurator.roomsLevels.levelNames.groundFloor');
        return t('configurator.roomsLevels.levelNames.floor', { number: level.id - 1 });
    };

    return (
        <div className="mx-auto max-w-6xl space-y-10 animate-fade-in pb-20">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <SectionTitle
                    title={t('configurator.roomsLevels.title')}
                    subtitle={t('configurator.roomsLevels.subtitle')}
                    badge={t('configurator.roomsLevels.badge')}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                    <Card className="rounded-[1.6rem] px-5 py-4 text-center">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('configurator.roomsLevels.summary.rooms')}</p>
                        <p className="mt-2 font-heading text-4xl font-semibold leading-none text-textPrimary">{totalRooms}</p>
                    </Card>
                    <Card className="rounded-[1.6rem] px-5 py-4 text-center">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('configurator.roomsLevels.summary.totalUnits')}</p>
                        <p className="mt-2 font-heading text-4xl font-semibold leading-none text-primary-700">{totalInstances}</p>
                    </Card>
                </div>
            </div>

            {!projectInfo.buildingType ? (
                <div className="rounded-[1.5rem] border border-amber-500/18 bg-amber-500/10 px-5 py-4 text-sm text-amber-200">
                    <div className="flex items-center gap-3">
                        <Info className="h-4.5 w-4.5" />
                        <p>{t('configurator.roomsLevels.missingBuildingType', { step: 1 })}</p>
                    </div>
                </div>
            ) : null}

            {noRoomTypesForBuilding ? (
                <div className="rounded-[1.5rem] border border-amber-500/18 bg-amber-500/10 px-5 py-4 text-sm text-amber-200">
                    <div className="flex items-center gap-3">
                        <Info className="h-4.5 w-4.5" />
                        <p>{t('configurator.roomsLevels.noRoomTypesForBuilding')}</p>
                    </div>
                </div>
            ) : null}

            <div className="space-y-5">
                {levels.map((level) => {
                    const isExpanded = expandedLevel === level.id;
                    const roomTypeCount = level.rooms.length;
                    const totalLogicalRooms = level.rooms.reduce((acc, room) => acc + normalizeRoomCount(room.roomCount ?? room.count), 0);

                    return (
                        <Card key={level.id} className="overflow-hidden rounded-[2rem]">
                            <div
                                className={clsx(
                                    'flex cursor-pointer items-center justify-between gap-4 px-5 py-5 transition-all duration-300 sm:px-6',
                                    isExpanded ? 'bg-primary-50' : 'bg-transparent hover:bg-[#EDEFE8]',
                                )}
                                onClick={() => setExpandedLevel(isExpanded ? null : level.id)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={clsx(
                                        'flex h-12 w-12 items-center justify-center rounded-2xl border',
                                        isExpanded ? 'border-primary-200 bg-primary-50 text-primary-700' : 'border-[#D1D5DB] bg-[#EDEFE8] text-textSecondary',
                                    )}>
                                        <Layers className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-textPrimary">{getLevelLabel(level)}</h4>
                                        <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-textSecondary">
                                            <span>{t('configurator.roomsLevels.levelSummary.roomTypes', { count: roomTypeCount })}</span>
                                            <span>{t('configurator.roomsLevels.levelSummary.totalUnits', { count: totalLogicalRooms })}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Button
                                        size="sm"
                                        onClick={(event) => { event.stopPropagation(); handleAddRoom(level.id); }}
                                        disabled={noRoomTypesForBuilding || effectiveRoomTypes.length === 0}
                                        className="gap-1.5"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        {t('configurator.roomsLevels.actions.addRoom')}
                                    </Button>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#D1D5DB] bg-[#EDEFE8] text-textSecondary">
                                        {isExpanded ? <ChevronUp className="h-4.5 w-4.5" /> : <ChevronDown className="h-4.5 w-4.5" />}
                                    </div>
                                </div>
                            </div>

                            {isExpanded ? (
                                <div className="border-t border-[#E5E7EB] bg-white/50 p-5 sm:p-6 animate-fade-in">
                                    {roomTypeCount > 0 ? (
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                            {level.rooms.map((room, idx) => (
                                                <RoomCard
                                                    key={room.id}
                                                    room={room}
                                                    idx={idx}
                                                    levelId={level.id}
                                                    roomTypes={effectiveRoomTypes}
                                                    onRemove={() => handleRemoveRoom(level.id, room.id)}
                                                    onUpdate={handleRoomUpdate}
                                                />
                                            ))}

                                            <button
                                                onClick={() => handleAddRoom(level.id)}
                                                disabled={noRoomTypesForBuilding || effectiveRoomTypes.length === 0}
                                                className="flex min-h-[210px] flex-col items-center justify-center gap-3 rounded-[1.7rem] border border-dashed border-[#D1D5DB] bg-[#F7F8F5] p-6 text-center transition-all duration-300 hover:border-primary-300 hover:bg-[#EDEFE8] disabled:pointer-events-none disabled:opacity-50"
                                            >
                                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary-200 bg-primary-50 text-primary-700">
                                                    <Plus className="h-5 w-5" />
                                                </div>
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-textSecondary">
                                                    {t('configurator.roomsLevels.actions.addAnotherRoom')}
                                                </p>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center space-y-5 py-16 text-center">
                                            <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] border border-[#D1D5DB] bg-[#F7F8F5] text-primary-700">
                                                <Home className="h-9 w-9" />
                                            </div>
                                            <div className="space-y-2">
                                                <h5 className="text-2xl font-semibold text-textPrimary">{t('configurator.roomsLevels.empty.title')}</h5>
                                                <p className="max-w-xs text-sm leading-relaxed text-textSecondary">{t('configurator.roomsLevels.empty.subtitle')}</p>
                                            </div>
                                            <Button onClick={() => handleAddRoom(level.id)} disabled={noRoomTypesForBuilding || effectiveRoomTypes.length === 0} className="gap-2">
                                                <Plus className="h-4 w-4" />
                                                {t('configurator.roomsLevels.actions.addFirstRoom')}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ) : null}
                        </Card>
                    );
                })}
            </div>

            <Card className="rounded-[1.75rem] p-5">
                <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-primary-200 bg-primary-50 text-primary-700">
                        <Info className="h-4.5 w-4.5" />
                    </div>
                    <div>
                        <p className="text-base font-semibold text-textPrimary">{t('configurator.roomsLevels.repeatedRooms.title')}</p>
                        <p className="mt-1 text-sm leading-relaxed text-textSecondary">{t('configurator.roomsLevels.repeatedRooms.subtitle')}</p>
                    </div>
                </div>
            </Card>
        </div>
    );
}

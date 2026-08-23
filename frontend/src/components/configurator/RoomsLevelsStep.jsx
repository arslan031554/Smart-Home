import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addRoomToLevel, removeRoomFromLevel, updateRoom } from '../../features/configurator/configuratorSlice';
import { Plus, Trash2, Layers, Info, ChevronDown, ChevronUp, Home, Copy, PencilLine } from 'lucide-react';
import { clsx } from 'clsx';
import { Button, Card, SectionTitle, Badge, Modal } from '../common/UIComponents';
import { normalizeRoomCount } from '../../utils/configuratorNormalization';
import { useTranslation } from 'react-i18next';

function buildNextRoomName(roomType, rooms = []) {
    const typeName = String(roomType?.name || 'Room').trim() || 'Room';
    const siblingCount = (Array.isArray(rooms) ? rooms : []).filter((room) => room?.type === roomType?.id).length;
    return siblingCount === 0 ? typeName : `${typeName} ${siblingCount + 1}`;
}

const RoomCard = React.memo(({ room, idx, levelId, roomType, onRemove, onUpdate }) => {
    const { t } = useTranslation();
    const effectiveRoomCount = normalizeRoomCount(room.roomCount ?? room.count);
    const [localRoomCount, setLocalRoomCount] = useState(effectiveRoomCount);
    const [localRoomName, setLocalRoomName] = useState(room.name || roomType?.name || '');

    React.useEffect(() => {
        setLocalRoomCount(effectiveRoomCount);
    }, [effectiveRoomCount]);

    React.useEffect(() => {
        setLocalRoomName(room.name || roomType?.name || '');
    }, [room.name, roomType?.name]);

    const handleBlurRoomCount = () => {
        const safe = normalizeRoomCount(localRoomCount);
        setLocalRoomCount(safe);
        if (safe !== effectiveRoomCount) onUpdate(levelId, room.id, { roomCount: safe });
    };

    const handleBlurRoomName = () => {
        const trimmed = String(localRoomName || '').trim() || roomType?.name || t('configurator.roomsLevels.roomCard.newRoomName');
        setLocalRoomName(trimmed);
        if (trimmed !== String(room.name || '').trim()) {
            onUpdate(levelId, room.id, { name: trimmed });
        }
    };

    return (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-soft transition-all duration-200 hover:border-primary-300 sm:p-4">
            <div className="flex items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-xs font-black text-primary-700 border border-primary-100">
                        {(idx + 1).toString().padStart(2, '0')}
                    </div>
                    <div className="min-w-0">
                        <span className="block truncate text-xs font-bold text-textPrimary">
                            {room.name || roomType?.name || t('configurator.roomsLevels.roomCard.unset')}
                        </span>
                        <span className="block text-[10px] font-semibold text-textSecondary uppercase tracking-wider">
                            {roomType?.name || t('configurator.summary.room')}
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onRemove}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-400 transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                    title={t('configurator.roomsLevels.roomCard.removeRoom')}
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>

            <div className="mt-3 space-y-2.5">
                {/* Room Name Input */}
                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">
                        {t('configurator.roomsLevels.roomCard.roomName', { defaultValue: 'Room Name' })}
                    </label>
                    <div className="relative">
                        <PencilLine className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={localRoomName}
                            onChange={(event) => setLocalRoomName(event.target.value)}
                            onBlur={handleBlurRoomName}
                            placeholder={roomType?.name || t('configurator.roomsLevels.roomCard.newRoomName')}
                            className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs font-medium text-textPrimary outline-none transition-all focus:border-primary-600 focus:ring-2 focus:ring-primary-500/10 shadow-xs"
                        />
                    </div>
                </div>

                {/* Identical Room Stepper */}
                <div className="flex items-center justify-between gap-2 pt-1">
                    <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-textSecondary">
                            {t('configurator.roomsLevels.roomCard.identicalRooms')}
                        </span>
                        {normalizeRoomCount(localRoomCount) > 1 ? (
                            <span className="text-[9px] font-semibold text-primary-700">
                                {normalizeRoomCount(localRoomCount)} {t('configurator.roomsLevels.summary.totalUnits', { defaultValue: 'Units' })}
                            </span>
                        ) : null}
                    </div>

                    <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/80 p-1">
                        <button
                            type="button"
                            onClick={() => {
                                const next = Math.max(1, normalizeRoomCount(localRoomCount) - 1);
                                setLocalRoomCount(next);
                                onUpdate(levelId, room.id, { roomCount: next });
                            }}
                            className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-slate-500 shadow-xs hover:bg-slate-100 hover:text-slate-900"
                        >
                            -
                        </button>
                        <input
                            type="number"
                            min="1"
                            max="100"
                            value={localRoomCount}
                            onChange={(event) => setLocalRoomCount(event.target.value)}
                            onBlur={handleBlurRoomCount}
                            className="w-8 bg-transparent text-center text-xs font-bold text-textPrimary tabular-nums outline-none"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                const next = normalizeRoomCount(localRoomCount) + 1;
                                setLocalRoomCount(next);
                                onUpdate(levelId, room.id, { roomCount: next });
                            }}
                            className="flex h-6 w-6 items-center justify-center rounded-md bg-primary-500 text-white shadow-xs hover:bg-primary-600"
                        >
                            +
                        </button>
                    </div>
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
    const allRoomTypesFromStore = useSelector((state) => state.admin.roomTypes);
    const [expandedLevel, setExpandedLevel] = useState(1);
    const [roomPicker, setRoomPicker] = useState({ isOpen: false, levelId: null, roomTypeId: '' });

    const allRoomTypes = useMemo(() => (Array.isArray(allRoomTypesFromStore) ? allRoomTypesFromStore : []), [allRoomTypesFromStore]);
    const roomTypesWithMappings = allRoomTypes.filter((type) => Array.isArray(type.buildingTypes) && type.buildingTypes.length > 0);
    const hasAnyMappedRoomTypes = roomTypesWithMappings.length > 0;
    const filteredRoomTypes = allRoomTypes.filter((type) => isRoomTypeAllowedForBuilding(type, projectInfo.buildingType, hasAnyMappedRoomTypes));
    const effectiveRoomTypes = projectInfo.buildingType ? filteredRoomTypes : allRoomTypes;
    const noRoomTypesForBuilding = Boolean(projectInfo.buildingType) && hasAnyMappedRoomTypes && effectiveRoomTypes.length === 0;
    const roomTypeMap = useMemo(() => new Map((allRoomTypes || []).map((roomType) => [roomType.id, roomType])), [allRoomTypes]);

    const openRoomPicker = (levelId) => {
        if (noRoomTypesForBuilding || effectiveRoomTypes.length === 0) return;
        setRoomPicker({
            isOpen: true,
            levelId,
            roomTypeId: effectiveRoomTypes[0]?.id || '',
        });
    };

    const closeRoomPicker = () => {
        setRoomPicker({ isOpen: false, levelId: null, roomTypeId: '' });
    };

    const handleConfirmRoomAdd = () => {
        const level = levels.find((item) => item.id === roomPicker.levelId);
        const selectedType = effectiveRoomTypes.find((type) => type.id === roomPicker.roomTypeId) || effectiveRoomTypes[0];
        if (!level || !selectedType) return;

        dispatch(addRoomToLevel({
            levelId: level.id,
            room: {
                type: selectedType.id,
                name: buildNextRoomName(selectedType, level.rooms),
                roomCount: 1,
            },
        }));
        closeRoomPicker();
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
        <div className="mx-auto max-w-6xl space-y-5 animate-fade-in pb-12 sm:space-y-6 sm:pb-16">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <SectionTitle
                    title={t('configurator.roomsLevels.title')}
                    subtitle={t('configurator.roomsLevels.subtitle')}
                    badge={t('configurator.roomsLevels.badge')}
                    className="mb-0"
                />
                <div className="flex items-center gap-3 shrink-0">
                    <div className="rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 text-center shadow-xs">
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-textSecondary">{t('configurator.roomsLevels.summary.rooms')}</span>
                        <span className="font-heading text-lg font-black text-textPrimary">{totalRooms}</span>
                    </div>
                    <div className="rounded-xl border border-primary-200/80 bg-primary-50/80 px-3.5 py-2 text-center shadow-xs">
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-primary-700">{t('configurator.roomsLevels.summary.totalUnits')}</span>
                        <span className="font-heading text-lg font-black text-primary-800">{totalInstances}</span>
                    </div>
                </div>
            </div>

            {!projectInfo.buildingType ? (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs font-semibold text-amber-800">
                    <div className="flex items-center gap-2.5">
                        <Info className="h-4 w-4 shrink-0 text-amber-600" />
                        <p>{t('configurator.roomsLevels.missingBuildingType', { step: 1 })}</p>
                    </div>
                </div>
            ) : null}

            {noRoomTypesForBuilding ? (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs font-semibold text-amber-800">
                    <div className="flex items-center gap-2.5">
                        <Info className="h-4 w-4 shrink-0 text-amber-600" />
                        <p>{t('configurator.roomsLevels.noRoomTypesForBuilding')}</p>
                    </div>
                </div>
            ) : null}

            {/* Levels Accordion List */}
            <div className="space-y-4">
                {levels.map((level) => {
                    const isExpanded = expandedLevel === level.id;
                    const roomTypeCount = level.rooms.length;
                    const totalLogicalRooms = level.rooms.reduce((acc, room) => acc + normalizeRoomCount(room.roomCount ?? room.count), 0);

                    return (
                        <Card key={level.id} className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-soft">
                            <div
                                className={clsx(
                                    'flex cursor-pointer items-center justify-between gap-3 px-4 py-3.5 transition-all sm:px-5 sm:py-4',
                                    isExpanded ? 'bg-primary-50/60 border-b border-slate-100' : 'bg-white hover:bg-slate-50/70',
                                )}
                                onClick={() => setExpandedLevel(isExpanded ? null : level.id)}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={clsx(
                                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all',
                                        isExpanded ? 'border-primary-300 bg-primary-600 text-white shadow-xs' : 'border-slate-200 bg-slate-50 text-slate-500',
                                    )}>
                                        <Layers className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="truncate text-sm font-bold text-textPrimary sm:text-base">{getLevelLabel(level)}</h4>
                                        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-textSecondary">
                                            <span>{t('configurator.roomsLevels.levelSummary.roomTypes', { count: roomTypeCount })}</span>
                                            <span>•</span>
                                            <span>{t('configurator.roomsLevels.levelSummary.totalUnits', { count: totalLogicalRooms })}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <Button
                                        size="sm"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            openRoomPicker(level.id);
                                        }}
                                        disabled={noRoomTypesForBuilding || effectiveRoomTypes.length === 0}
                                        className="h-8 px-2.5 rounded-lg gap-1 text-[11px]"
                                    >
                                        <Plus className="h-3 w-3" />
                                        <span className="hidden sm:inline">{t('configurator.roomsLevels.actions.addRoom')}</span>
                                    </Button>
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400">
                                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    </div>
                                </div>
                            </div>

                            {isExpanded ? (
                                <div className="bg-[#fbfcfa] p-3.5 sm:p-5 animate-fade-in">
                                    {roomTypeCount > 0 ? (
                                        <div className="max-h-[480px] sm:max-h-[560px] overflow-y-auto custom-scrollbar p-1 -m-1">
                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                {level.rooms.map((room, idx) => (
                                                    <RoomCard
                                                        key={room.id}
                                                        room={room}
                                                        idx={idx}
                                                        levelId={level.id}
                                                        roomType={roomTypeMap.get(room.type)}
                                                        onRemove={() => handleRemoveRoom(level.id, room.id)}
                                                        onUpdate={handleRoomUpdate}
                                                    />
                                                ))}

                                                <button
                                                    type="button"
                                                    onClick={() => openRoomPicker(level.id)}
                                                    disabled={noRoomTypesForBuilding || effectiveRoomTypes.length === 0}
                                                    className="flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white/70 p-4 text-center transition-all hover:border-primary-400 hover:bg-white disabled:pointer-events-none disabled:opacity-50 shadow-xs"
                                                >
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-700 border border-primary-200">
                                                        <Plus className="h-4 w-4" />
                                                    </div>
                                                    <p className="text-xs font-bold text-textPrimary">
                                                        {t('configurator.roomsLevels.actions.addAnotherRoom')}
                                                    </p>
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-10 text-center">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-slate-200 text-primary-700 shadow-xs mb-3">
                                                <Home className="h-6 w-6" />
                                            </div>
                                            <h5 className="text-base font-bold text-textPrimary">{t('configurator.roomsLevels.empty.title')}</h5>
                                            <p className="max-w-xs text-xs text-textSecondary mt-1 mb-4">{t('configurator.roomsLevels.empty.subtitle')}</p>
                                            <Button size="sm" onClick={() => openRoomPicker(level.id)} disabled={noRoomTypesForBuilding || effectiveRoomTypes.length === 0} className="gap-1.5 rounded-xl">
                                                <Plus className="h-3.5 w-3.5" />
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

            {/* Repeated Rooms notice */}
            <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-soft">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700 border border-primary-100">
                    <Info className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                    <p className="text-xs font-bold text-textPrimary">{t('configurator.roomsLevels.repeatedRooms.title')}</p>
                    <p className="text-xs leading-relaxed text-textSecondary">{t('configurator.roomsLevels.repeatedRooms.subtitle')}</p>
                </div>
            </div>

            {/* Room Picker Modal */}
            <Modal
                isOpen={roomPicker.isOpen}
                onClose={closeRoomPicker}
                title={t('configurator.roomsLevels.roomPicker.title', { defaultValue: 'Add Room' })}
                maxWidth="max-w-2xl"
                footer={(
                    <div className="flex w-full items-center justify-end gap-2.5">
                        <Button variant="ghost" size="sm" onClick={closeRoomPicker}>
                            {t('configurator.roomsLevels.roomPicker.cancel', { defaultValue: 'Cancel' })}
                        </Button>
                        <Button size="sm" onClick={handleConfirmRoomAdd} disabled={!roomPicker.roomTypeId}>
                            {t('configurator.roomsLevels.roomPicker.confirm', { defaultValue: 'Add Room' })}
                        </Button>
                    </div>
                )}
            >
                <div className="space-y-4">
                    <p className="text-xs leading-relaxed text-textSecondary">
                        {t('configurator.roomsLevels.roomPicker.subtitle', { defaultValue: 'Choose the room type now. You can customize the name and quantities.' })}
                    </p>

                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 max-h-[360px] overflow-y-auto custom-scrollbar p-1">
                        {effectiveRoomTypes.map((roomType) => {
                            const isSelected = roomPicker.roomTypeId === roomType.id;
                            return (
                                <button
                                    key={roomType.id}
                                    type="button"
                                    onClick={() => setRoomPicker((prev) => ({ ...prev, roomTypeId: roomType.id }))}
                                    className={clsx(
                                        'rounded-xl border p-3.5 text-left transition-all',
                                        isSelected
                                            ? 'border-primary-500 bg-primary-50/80 shadow-xs ring-1 ring-primary-500/25'
                                            : 'border-slate-200 bg-white hover:border-primary-300 hover:bg-slate-50'
                                    )}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-xs sm:text-sm font-bold text-textPrimary">{roomType.name}</p>
                                        {isSelected ? (
                                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-white text-[9px] font-bold">
                                                ✓
                                            </span>
                                        ) : null}
                                    </div>
                                    <p className="mt-1 text-[11px] leading-relaxed text-textSecondary line-clamp-2">
                                        {roomType.description || t('configurator.roomsLevels.roomPicker.noDescription', { defaultValue: 'Standard smart room.' })}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </Modal>
        </div>
    );
}

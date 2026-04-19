import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addRoomToLevel, removeRoomFromLevel, updateRoom } from '../../features/configurator/configuratorSlice';
import { Plus, Trash2, Layers, Info, ChevronDown, ChevronUp, Home, Copy, Box, PencilLine } from 'lucide-react';
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
        <div className="rounded-[1.7rem] border border-[#E5E7EB] bg-white p-5 shadow-soft transition-all duration-300 hover:border-primary-300 hover:bg-white/50">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary-200 bg-primary-50 text-sm font-semibold text-primary-700">
                        {(idx + 1).toString().padStart(2, '0')}
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('configurator.roomsLevels.roomCard.title')}</p>
                        <p className="mt-1 text-sm font-medium text-textPrimary">{room.name || roomType?.name || t('configurator.roomsLevels.roomCard.unset')}</p>
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
                    <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-textSecondary">
                        {t('configurator.roomsLevels.roomCard.roomName', { defaultValue: 'Room Name' })}
                    </label>
                    <div className="relative">
                        <PencilLine className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-textSecondary" />
                        <input
                            type="text"
                            value={localRoomName}
                            onChange={(event) => setLocalRoomName(event.target.value)}
                            onBlur={handleBlurRoomName}
                            placeholder={roomType?.name || t('configurator.roomsLevels.roomCard.newRoomName')}
                            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-3 text-sm font-medium text-textPrimary outline-none transition-all focus:border-primary-700 focus:ring-4 focus:ring-primary-500/10"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-textSecondary">
                        {t('configurator.roomsLevels.roomCard.roomType')}
                    </label>
                    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500">
                                <Box className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-textPrimary">{roomType?.name || t('configurator.roomsLevels.roomCard.unset')}</p>
                                <p className="text-[11px] text-textSecondary">
                                    {t('configurator.roomsLevels.roomCard.roomTypeLocked', { defaultValue: 'Room type is fixed after creation.' })}
                                </p>
                            </div>
                        </div>
                        <Badge variant="neutral" className="border-slate-200 bg-white text-slate-500">
                            {t('configurator.roomsLevels.roomCard.fixedLabel', { defaultValue: 'Fixed' })}
                        </Badge>
                    </div>
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
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            openRoomPicker(level.id);
                                        }}
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
                                                    roomType={roomTypeMap.get(room.type)}
                                                    onRemove={() => handleRemoveRoom(level.id, room.id)}
                                                    onUpdate={handleRoomUpdate}
                                                />
                                            ))}

                                            <button
                                                onClick={() => openRoomPicker(level.id)}
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
                                            <Button onClick={() => openRoomPicker(level.id)} disabled={noRoomTypesForBuilding || effectiveRoomTypes.length === 0} className="gap-2">
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

            <Modal
                isOpen={roomPicker.isOpen}
                onClose={closeRoomPicker}
                title={t('configurator.roomsLevels.roomPicker.title', { defaultValue: 'Add Room' })}
                maxWidth="max-w-3xl"
                footer={(
                    <div className="flex w-full items-center justify-end gap-3">
                        <Button variant="ghost" onClick={closeRoomPicker}>
                            {t('configurator.roomsLevels.roomPicker.cancel', { defaultValue: 'Cancel' })}
                        </Button>
                        <Button onClick={handleConfirmRoomAdd} disabled={!roomPicker.roomTypeId}>
                            {t('configurator.roomsLevels.roomPicker.confirm', { defaultValue: 'Add Room' })}
                        </Button>
                    </div>
                )}
            >
                <div className="space-y-5">
                    <p className="text-sm leading-relaxed text-textSecondary">
                        {t('configurator.roomsLevels.roomPicker.subtitle', { defaultValue: 'Choose the room type now. After the room is created, its type stays fixed and only the room name and quantity can be edited.' })}
                    </p>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {effectiveRoomTypes.map((roomType) => {
                            const isSelected = roomPicker.roomTypeId === roomType.id;
                            return (
                                <button
                                    key={roomType.id}
                                    type="button"
                                    onClick={() => setRoomPicker((prev) => ({ ...prev, roomTypeId: roomType.id }))}
                                    className={clsx(
                                        'rounded-[1.5rem] border p-5 text-left transition-all',
                                        isSelected
                                            ? 'border-primary-500 bg-primary-500/10'
                                            : 'border-white/10 bg-white/5 hover:border-primary-500/25'
                                    )}
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-semibold text-textPrimary">{roomType.name}</p>
                                            <p className="mt-1 text-xs leading-relaxed text-textSecondary">
                                                {roomType.description || t('configurator.roomsLevels.roomPicker.noDescription', { defaultValue: 'No customer-facing description added yet.' })}
                                            </p>
                                        </div>
                                        {isSelected ? (
                                            <Badge variant="info" className="shrink-0">
                                                {t('configurator.roomsLevels.roomPicker.selected', { defaultValue: 'Selected' })}
                                            </Badge>
                                        ) : null}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </Modal>
        </div>
    );
}

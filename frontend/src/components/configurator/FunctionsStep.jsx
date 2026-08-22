import React, { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    addFunctionToRoom,
    removeFunctionFromRoom,
    updateFunctionQuantity,
} from '../../features/configurator/configuratorSlice';
import {
    Zap, Thermometer, Shield, Monitor, Layers, Battery,
    Plus, Minus, X, Box, Camera, Key, Droplets, Waves, Sun, Search,
    Info, Activity, ChevronRight, Home, Sparkles, ShieldAlert
} from 'lucide-react';
import { clsx } from 'clsx';
import { Badge, Card, SectionTitle, Button } from '../common/UIComponents';
import { normalizeRoomCount } from '../../utils/configuratorNormalization';
import { useTranslation } from 'react-i18next';

const ICON_MAP = {
    Sun,
    Thermometer,
    Shield,
    Monitor,
    Layers,
    Zap,
    Battery,
    Camera,
    Key,
    Droplets,
    Waves,
    Box,
    Activity,
};

function getIcon(name, cls = 'w-5 h-5') {
    const Icon = ICON_MAP[name] || Box;
    return <Icon className={cls} />;
}

const FunctionCard = React.memo(({ func, addedFunc, onAdd, onRemove, onQuantityChange }) => {
    const { t } = useTranslation();
    const isAdded = Boolean(addedFunc);

    const handleQtyBlur = (event) => {
        const quantity = Math.max(1, parseInt(event?.target?.value, 10) || 1);
        event.target.value = quantity;
        if (addedFunc) onQuantityChange(quantity);
    };

    return (
        <div
            className={clsx(
                'group relative flex flex-col justify-between rounded-2xl border p-5 transition-all duration-300',
                isAdded
                    ? 'border-primary-400 bg-primary-50/50 shadow-md ring-1 ring-primary-400/30'
                    : 'border-[#E5E7EB] bg-white shadow-soft hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-card-hover'
            )}
        >
            {isAdded ? (
                <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-primary-600" />
            ) : null}

            <div>
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                        <div
                            className={clsx(
                                'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border transition-all duration-300',
                                isAdded
                                    ? 'border-primary-300 bg-primary-600 text-white shadow-sm'
                                    : 'border-primary-100 bg-primary-50 text-primary-700 group-hover:border-primary-200 group-hover:bg-primary-100/80'
                            )}
                        >
                            {getIcon(func.icon, 'h-5 w-5')}
                        </div>
                        <div className="min-w-0">
                            <h4 className="truncate text-base sm:text-[17px] font-bold leading-snug text-textPrimary group-hover:text-primary-800 transition-colors">
                                {func.name}
                            </h4>
                            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-textSecondary">
                                {func.code}
                            </p>
                        </div>
                    </div>
                    {isAdded ? (
                        <Badge variant="success" className="h-5 shrink-0 px-2 text-[9px] font-bold">
                            {t('configurator.functions.active', { defaultValue: 'Active' })}
                        </Badge>
                    ) : null}
                </div>

                <div className="mt-4 min-h-[4rem]">
                    {func.description ? (
                        <p className="text-xs sm:text-[13px] leading-relaxed text-textSecondary line-clamp-4">
                            {func.description}
                        </p>
                    ) : null}
                </div>
            </div>

            <div className="mt-4 pt-1">
                {isAdded ? (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between rounded-lg border border-primary-200/80 bg-white px-3 py-1.5 shadow-xs">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">
                                {t('configurator.summary.quantity')}
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        const quantity = (addedFunc.quantity || 1) - 1;
                                        if (quantity <= 0) onRemove();
                                        else onQuantityChange(quantity);
                                    }}
                                    className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-500 transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                                >
                                    <Minus className="h-3 w-3" />
                                </button>
                                <input
                                    type="number"
                                    min="1"
                                    key={`${func.id}-${addedFunc?.quantity || 1}`}
                                    defaultValue={addedFunc?.quantity || 1}
                                    onBlur={handleQtyBlur}
                                    className="w-7 bg-transparent text-center text-xs font-bold text-textPrimary tabular-nums focus:outline-none"
                                />
                                <button
                                    onClick={() => onQuantityChange((addedFunc.quantity || 1) + 1)}
                                    className="flex h-6 w-6 items-center justify-center rounded-md border border-primary-200 bg-primary-50 text-primary-700 transition-all hover:bg-primary-100"
                                >
                                    <Plus className="h-3 w-3" />
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={onRemove}
                            className="flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white text-[11px] font-semibold tracking-wide text-red-500 transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                        >
                            <X className="h-3 w-3" />
                            {t('configurator.functions.remove', { defaultValue: 'Remove' })}
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={onAdd}
                        className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-primary-700 text-xs font-semibold tracking-wide text-white shadow-xs transition-all duration-200 hover:bg-primary-800 active:scale-[0.99]"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        {t('configurator.functions.add', { defaultValue: 'Add Function' })}
                    </button>
                )}
            </div>
        </div>
    );
});
FunctionCard.displayName = 'FunctionCard';

const SelectedFunctionCard = React.memo(({ func, onRemove, onQuantityChange }) => {
    const { t } = useTranslation();

    const handleQtyBlur = (event) => {
        const quantity = Math.max(1, parseInt(event?.target?.value, 10) || 1);
        event.target.value = quantity;
        onQuantityChange(quantity);
    };

    return (
        <div className="group relative flex flex-col justify-between rounded-2xl border border-primary-200/80 bg-white p-5 shadow-soft transition-all duration-300 hover:border-primary-300 hover:shadow-card-hover">
            <div>
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-primary-200 bg-primary-50 text-primary-700 shadow-sm">
                            {getIcon(func.icon, 'h-5 w-5')}
                        </div>
                        <div className="min-w-0">
                            <h4 className="truncate text-base sm:text-[17px] font-bold leading-snug text-textPrimary">{func.name}</h4>
                            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-textSecondary">{func.code}</p>
                        </div>
                    </div>
                    <button
                        onClick={onRemove}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-textSecondary transition-all hover:border-red-500/18 hover:bg-red-500/10 hover:text-red-500"
                        title={t('configurator.functions.remove', { defaultValue: 'Remove Function' })}
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>

                <div className="mt-4 min-h-[3.5rem]">
                    {func.description ? (
                        <p className="text-xs sm:text-[13px] leading-relaxed text-textSecondary line-clamp-4">{func.description}</p>
                    ) : null}
                </div>
            </div>

            <div className="mt-4 pt-1">
                <div className="flex items-center justify-between rounded-lg border border-slate-200/80 bg-slate-50/70 px-3.5 py-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">{t('configurator.summary.quantity')}</span>
                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={() => {
                                const quantity = (func.quantity || 1) - 1;
                                if (quantity <= 0) onRemove();
                                else onQuantityChange(quantity);
                            }}
                            className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 shadow-xs transition-all hover:border-red-300 hover:text-red-500"
                        >
                            <Minus className="h-3 w-3" />
                        </button>
                        <input
                            type="number"
                            min="1"
                            key={`${func.id}-${func.quantity || 1}`}
                            defaultValue={func.quantity || 1}
                            onBlur={handleQtyBlur}
                            className="w-8 bg-transparent text-center text-xs font-bold text-textPrimary tabular-nums focus:outline-none"
                        />
                        <button
                            onClick={() => onQuantityChange((func.quantity || 1) + 1)}
                            className="flex h-6 w-6 items-center justify-center rounded-md border border-primary-200 bg-primary-50 text-primary-700 shadow-xs transition-all hover:bg-primary-100"
                        >
                            <Plus className="h-3 w-3" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});
SelectedFunctionCard.displayName = 'SelectedFunctionCard';

export default function FunctionsStep() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const levelsFromStore = useSelector((state) => state.configurator?.levels);
    const allFunctionsFromStore = useSelector((state) => state.admin.smartFunctions);
    const roomTypesFromStore = useSelector((state) => state.admin.roomTypes);
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [functionSearch, setFunctionSearch] = useState('');

    const levels = useMemo(
        () => (Array.isArray(levelsFromStore) ? levelsFromStore : []),
        [levelsFromStore]
    );

    const allFunctions = useMemo(
        () => (Array.isArray(allFunctionsFromStore) ? allFunctionsFromStore : []),
        [allFunctionsFromStore]
    );

    const roomTypeMap = useMemo(() => {
        const roomTypes = Array.isArray(roomTypesFromStore) ? roomTypesFromStore : [];
        return new Map(roomTypes.map((roomType) => [roomType.id, roomType]));
    }, [roomTypesFromStore]);

    const allRooms = useMemo(() => levels.flatMap((level) => {
        const rooms = Array.isArray(level?.rooms) ? level.rooms : [];
        return rooms.map((room) => ({
            ...room,
            functions: Array.isArray(room?.functions) ? room.functions : [],
            levelId: level.id,
            levelName: level.name,
            roomTypeName: roomTypeMap.get(room.type)?.name || room.type || t('configurator.summary.room'),
            roomCount: normalizeRoomCount(room.roomCount ?? room.count),
        }));
    }), [levels, roomTypeMap, t]);

    const firstRoomId = useMemo(() => allRooms[0]?.id || null, [allRooms]);

    const activeRoomId = useMemo(() => {
        if (!selectedRoomId) return firstRoomId;
        return allRooms.some((room) => room.id === selectedRoomId) ? selectedRoomId : firstRoomId;
    }, [allRooms, firstRoomId, selectedRoomId]);

    const currentRoom = useMemo(() => allRooms.find((room) => room.id === activeRoomId) || null, [allRooms, activeRoomId]);

    React.useEffect(() => {
        setFunctionSearch('');
    }, [activeRoomId]);

    const availableFunctions = useMemo(() => {
        if (!currentRoom) return [];
        return allFunctions.filter((func) => {
            const roomTypeIds = Array.isArray(func.roomTypes) ? func.roomTypes : [];
            if (roomTypeIds.length === 0) return true;
            return roomTypeIds.some((roomTypeId) => roomTypeId === currentRoom.type || roomTypeId?.id === currentRoom.type);
        });
    }, [allFunctions, currentRoom]);

    const currentRoomSelections = useMemo(() => {
        if (!currentRoom) return [];

        const masterFunctionMap = new Map(allFunctions.map((func) => [func.id, func]));
        return (Array.isArray(currentRoom.functions) ? currentRoom.functions : []).map((selection) => {
            const functionId = selection?.smartFunctionId || selection?.id;
            const master = masterFunctionMap.get(functionId) || {};
            return {
                ...master,
                ...selection,
                id: functionId,
                smartFunctionId: functionId,
                quantity: normalizeRoomCount(selection?.quantity),
                name: master.name || selection?.name || t('configurator.summary.configuredFunction'),
                code: master.code || selection?.code || functionId,
                description: master.description || selection?.description || '',
                icon: master.icon || selection?.icon || null,
                channelType: master.channelType || selection?.channelType || 'GENERAL',
                inputChannelCount: master.inputChannelCount ?? selection?.inputChannelCount ?? 0,
                outputChannelCount: master.outputChannelCount ?? selection?.outputChannelCount ?? 0,
                generalChannelCount: master.generalChannelCount ?? selection?.generalChannelCount ?? 0,
            };
        }).filter((selection) => Boolean(selection.id));
    }, [allFunctions, currentRoom, t]);

    const selectedFunctionIds = useMemo(
        () => new Set(currentRoomSelections.map((func) => func.id)),
        [currentRoomSelections]
    );

    const addableFunctions = useMemo(
        () => availableFunctions.filter((func) => !selectedFunctionIds.has(func.id)),
        [availableFunctions, selectedFunctionIds]
    );

    const filteredAddableFunctions = useMemo(() => {
        const searchTerm = functionSearch.trim().toLowerCase();
        if (!searchTerm) return addableFunctions;

        return addableFunctions.filter((func) => {
            const haystack = `${func.name || ''} ${func.code || ''} ${func.description || ''}`.toLowerCase();
            return haystack.includes(searchTerm);
        });
    }, [addableFunctions, functionSearch]);

    const handleAdd = useCallback((func) => {
        if (!currentRoom) return;
        dispatch(addFunctionToRoom({ levelId: currentRoom.levelId, roomId: currentRoom.id, func }));
    }, [currentRoom, dispatch]);

    const handleRemove = useCallback((funcId) => {
        if (!currentRoom) return;
        dispatch(removeFunctionFromRoom({ levelId: currentRoom.levelId, roomId: currentRoom.id, funcId }));
    }, [currentRoom, dispatch]);

    const handleQuantityChange = useCallback((funcId, quantity) => {
        if (!currentRoom) return;
        dispatch(updateFunctionQuantity({ levelId: currentRoom.levelId, roomId: currentRoom.id, funcId, quantity }));
    }, [currentRoom, dispatch]);

    const totalSelectedCount = useMemo(() => levels.reduce((levelAcc, level) => {
        const rooms = Array.isArray(level?.rooms) ? level.rooms : [];
        return levelAcc + rooms.reduce((roomAcc, room) => roomAcc + (Array.isArray(room?.functions) ? room.functions.length : 0), 0);
    }, 0), [levels]);

    const coveredRoomsCount = useMemo(() => levels.reduce((levelAcc, level) => {
        const rooms = Array.isArray(level?.rooms) ? level.rooms : [];
        return levelAcc + rooms.filter((room) => Array.isArray(room?.functions) && room.functions.length > 0).length;
    }, 0), [levels]);

    return (
        <div className="mx-auto max-w-7xl space-y-6 animate-fade-in pb-12 sm:space-y-8 sm:pb-16">
            {/* Header and Stats */}
            <div className="flex flex-col gap-6 border-b border-slate-200/80 pb-6">
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                    <SectionTitle
                        title={t('configurator.functions.title', { defaultValue: 'Select Smart Functions for Each Room' })}
                        subtitle={t('configurator.functions.subtitle', { defaultValue: 'Only compatible smart functions for the selected room are shown. Products and services are calculated automatically from these room-by-room choices.' })}
                        badge={t('configurator.functions.badge', { defaultValue: 'Step 03: Smart Functions' })}
                    />

                    <div className="flex flex-shrink-0 items-center gap-5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-soft sm:px-6">
                        <div className="text-center">
                            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-textSecondary">{t('configurator.functions.selectedCount', { defaultValue: 'Functions Selected' })}</p>
                            <p className="text-3xl font-black tabular-nums text-textPrimary">{totalSelectedCount}</p>
                        </div>
                        <div className="h-9 w-px bg-slate-200" />
                        <div className="text-center">
                            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-textSecondary">{t('configurator.functions.roomsCovered', { defaultValue: 'Rooms Covered' })}</p>
                            <p className="text-3xl font-black tabular-nums text-primary-700">{coveredRoomsCount}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start xl:gap-8">
                {/* Left Sidebar: Rooms List */}
                <aside className="w-full shrink-0 space-y-3 lg:w-72 xl:w-80">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[11px] font-bold uppercase tracking-wider text-textSecondary">{t('configurator.functions.rooms', { defaultValue: 'Rooms' })}</h3>
                        <Badge variant="neutral" className="border-none bg-slate-100 text-[10px] font-bold">
                            {allRooms.length} {t('configurator.summary.rooms', { defaultValue: 'Rooms' })}
                        </Badge>
                    </div>

                    <div className="max-h-[600px] overflow-y-auto rounded-2xl border border-slate-200/80 bg-white shadow-soft divide-y divide-slate-100">
                        {levels.map((level) => {
                            const levelRooms = Array.isArray(level?.rooms) ? level.rooms : [];
                            return (
                                <div key={level.id} className="border-b border-slate-100 last:border-0">
                                    <div className="sticky top-0 z-10 flex items-center gap-2 bg-[#f9faf6] px-4 py-2.5 border-b border-slate-100/80 backdrop-blur-sm">
                                        <Layers className="h-3.5 w-3.5 text-primary-700" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">{level.name}</span>
                                    </div>

                                    <div className="divide-y divide-slate-100/60 p-1.5 space-y-1">
                                        {levelRooms.length > 0 ? levelRooms.map((room) => {
                                            const resolvedRoom = allRooms.find((item) => item.id === room.id) || room;
                                            const isActive = activeRoomId === room.id;
                                            const functionCount = Array.isArray(room?.functions) ? room.functions.length : 0;
                                            return (
                                                <button
                                                    key={room.id}
                                                    onClick={() => setSelectedRoomId(room.id)}
                                                    className={clsx(
                                                        'group flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-left transition-all',
                                                        isActive
                                                            ? 'bg-primary-700 text-white shadow-xs'
                                                            : 'text-textPrimary hover:bg-primary-50/60 hover:text-primary-800'
                                                    )}
                                                >
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <div className={clsx(
                                                            'h-2 w-2 flex-shrink-0 rounded-full transition-all',
                                                            isActive ? 'bg-white' : functionCount > 0 ? 'bg-emerald-500' : 'bg-slate-300'
                                                        )} />
                                                        <div className="min-w-0">
                                                            <span className="block truncate text-sm font-bold leading-tight">{resolvedRoom.name}</span>
                                                            <span className={clsx(
                                                                'mt-0.5 block text-[10px] font-medium uppercase tracking-wider truncate',
                                                                isActive ? 'text-primary-100' : 'text-textSecondary'
                                                            )}>
                                                                {resolvedRoom.roomTypeName}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="ml-2 flex items-center gap-1.5 shrink-0">
                                                        {resolvedRoom.roomCount > 1 ? (
                                                            <span className={clsx(
                                                                'rounded-md px-1.5 py-0.5 text-[9px] font-bold',
                                                                isActive ? 'bg-white/20 text-white' : 'bg-primary-50 text-primary-700 border border-primary-100'
                                                            )}>
                                                                x{resolvedRoom.roomCount}
                                                            </span>
                                                        ) : null}
                                                        {functionCount > 0 ? (
                                                            <span className={clsx(
                                                                'rounded-md px-1.5 py-0.5 text-[10px] font-bold',
                                                                isActive ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                                            )}>
                                                                {functionCount}
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                </button>
                                            );
                                        }) : (
                                            <div className="px-4 py-4 text-[11px] font-medium italic text-textSecondary">{t('configurator.functions.noSpaces', { defaultValue: 'No spaces configured' })}</div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </aside>

                {/* Right Main Content */}
                <main className="flex-1 min-w-0 space-y-6">
                    {currentRoom ? (
                        <div className="space-y-6">
                            {/* Active Room Hero Card */}
                            <div className="flex flex-col justify-between gap-5 rounded-2xl border border-primary-200/70 bg-[#f7f8f2] p-5 shadow-soft sm:flex-row sm:items-center sm:p-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl border border-primary-200 bg-white text-primary-700 shadow-xs">
                                        <Home className="h-6 w-6" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="mb-1 flex items-center gap-2">
                                            <Badge variant="info" className="px-2.5 py-0.5 text-[10px] font-bold uppercase">
                                                {currentRoom.levelName}
                                            </Badge>
                                            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                                            <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider">
                                                {currentRoom.roomTypeName}
                                            </span>
                                        </div>
                                        <h3 className="truncate text-2xl font-extrabold tracking-tight text-textPrimary sm:text-3xl">{currentRoom.name}</h3>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 self-start rounded-xl border border-slate-200/80 bg-white p-3 shadow-xs sm:self-auto">
                                    <div className="px-3 text-right">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">{t('configurator.functions.selectedCount', { defaultValue: 'Functions' })}</p>
                                        <p className="text-xl font-black text-textPrimary">{currentRoomSelections.length}</p>
                                    </div>
                                    {currentRoom.roomCount > 1 ? (
                                        <>
                                            <div className="h-7 w-px bg-slate-200" />
                                            <div className="px-3 text-right">
                                                <Badge variant="primary" className="mb-0.5 px-2 py-0.5 text-[9px] font-bold">
                                                    x{currentRoom.roomCount} {t('configurator.roomsLevels.summary.totalUnits', { defaultValue: 'Units' })}
                                                </Badge>
                                                <p className="text-[9px] text-textSecondary">{t('configurator.functions.repeatedNotice', { defaultValue: 'Quantities multiplied' })}</p>
                                            </div>
                                        </>
                                    ) : null}
                                </div>
                            </div>

                            {/* Function Lists */}
                            {availableFunctions.length > 0 ? (
                                <div className="space-y-8">
                                    {/* Section 1: Selected in this room */}
                                    <section className="space-y-4">
                                        <div className="flex items-center justify-between gap-4 px-1">
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-textSecondary">{t('configurator.functions.selectedInRoom', { defaultValue: 'Selected Functions In This Room' })}</h3>
                                            <Badge variant="neutral" className="border-none bg-slate-100 px-3 py-1 text-[10px] font-bold">
                                                {currentRoomSelections.length} {t('configurator.functions.active', { defaultValue: 'Active' })}
                                            </Badge>
                                        </div>

                                        {currentRoomSelections.length > 0 ? (
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                                {currentRoomSelections.map((func) => (
                                                    <SelectedFunctionCard
                                                        key={`${activeRoomId || 'none'}-selected-${func.id}`}
                                                        func={func}
                                                        onRemove={() => handleRemove(func.id)}
                                                        onQuantityChange={(quantity) => handleQuantityChange(func.id, quantity)}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-6 text-center shadow-xs">
                                                <p className="text-xs sm:text-sm text-textSecondary">
                                                    No functions selected for <strong>{currentRoom.name}</strong> yet. Choose from the available options below.
                                                </p>
                                            </div>
                                        )}
                                    </section>

                                    {/* Section 2: Add Compatible Functions */}
                                    <section className="space-y-4">
                                        <div className="flex flex-col justify-between gap-3 px-1 sm:flex-row sm:items-end">
                                            <div>
                                                <h3 className="text-xs font-bold uppercase tracking-wider text-textSecondary">{t('configurator.functions.addCompatible', { defaultValue: 'Add Compatible Functions' })}</h3>
                                                <p className="mt-0.5 text-xs text-textSecondary">
                                                    Only functions compatible with {currentRoom.roomTypeName} are displayed.
                                                </p>
                                            </div>
                                            <Badge variant="neutral" className="border-none bg-slate-100 px-3 py-1 text-[10px] font-bold self-start sm:self-auto">
                                                {addableFunctions.length} {t('configurator.functions.available', { defaultValue: 'Available' })}
                                            </Badge>
                                        </div>

                                        <div className="max-w-md">
                                            <div className="relative">
                                                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="text"
                                                    value={functionSearch}
                                                    onChange={(event) => setFunctionSearch(event.target.value)}
                                                    placeholder={t('configurator.functions.search', { defaultValue: 'Search compatible functions...' })}
                                                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-textPrimary placeholder:text-textSecondary outline-none transition-all focus:border-primary-600 focus:ring-2 focus:ring-primary-500/10 shadow-xs"
                                                />
                                            </div>
                                        </div>

                                        {filteredAddableFunctions.length > 0 ? (
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                                                {filteredAddableFunctions.map((func) => (
                                                    <FunctionCard
                                                        key={`${activeRoomId || 'none'}-${func.id}`}
                                                        func={func}
                                                        addedFunc={null}
                                                        onAdd={() => handleAdd(func)}
                                                        onRemove={() => handleRemove(func.id)}
                                                        onQuantityChange={(quantity) => handleQuantityChange(func.id, quantity)}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-6 text-center shadow-xs">
                                                <p className="text-xs sm:text-sm text-textSecondary">
                                                    {addableFunctions.length === 0
                                                        ? t('configurator.functions.allSelected', { defaultValue: 'All compatible functions are already added to this room.' })
                                                        : t('configurator.functions.noSearchMatch', { defaultValue: 'No compatible functions match your search.' })}
                                                </p>
                                            </div>
                                        )}
                                    </section>
                                </div>
                            ) : (
                                <div className="space-y-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-12 text-center">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-xs">
                                        <ShieldAlert className="h-8 w-8 text-slate-300" />
                                    </div>
                                    <div className="mx-auto max-w-md px-6">
                                        <h4 className="text-base font-bold text-textPrimary">{t('configurator.functions.noneAvailable', { defaultValue: 'No compatible functions available' })}</h4>
                                        <p className="mt-1 text-xs text-textSecondary">
                                            {t('configurator.functions.noneAvailableForType', { roomType: currentRoom.roomTypeName, defaultValue: 'No compatible functions are available for this room type: {{roomType}}.' })}
                                        </p>
                                        <div className="pt-4">
                                            <Button variant="outline" size="sm" onClick={() => setSelectedRoomId(null)}>
                                                {t('configurator.functions.selectDifferentRoom', { defaultValue: 'Select Different Room' })}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4 py-20 text-center">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 shadow-inner">
                                <Monitor className="h-10 w-10 text-slate-300" />
                            </div>
                            <div className="mx-auto max-w-sm">
                                <h3 className="text-xl font-bold text-textPrimary">{t('configurator.functions.selectRoom', { defaultValue: 'Select a Room' })}</h3>
                                <p className="mt-1 text-xs text-textSecondary leading-relaxed">
                                    {t('configurator.functions.selectRoomHelp', { defaultValue: 'Choose a room from the left panel to begin assigning smart functions.' })}
                                </p>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Bottom Helper / Information Card */}
            <div className="flex items-start gap-4 rounded-2xl border border-primary-200/70 bg-[#f7f8f2] p-5 shadow-soft sm:p-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border border-primary-200 text-primary-700 shadow-xs">
                    <Info className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-textPrimary">{t('configurator.functions.information', { defaultValue: 'Information' })}</h5>
                    <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">
                        {t('configurator.functions.informationBody', { defaultValue: 'You choose what each room should do. The system then calculates products, services, and totals from the backoffice master data and channel rules.' })}
                    </p>
                </div>
            </div>
        </div>
    );
}


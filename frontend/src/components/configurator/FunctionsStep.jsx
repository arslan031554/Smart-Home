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

const SCOPE_MAP = {
    IN: { label: 'Per Room', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-100' },
    OUT: { label: 'Per Level', cls: 'bg-blue-50 text-blue-700 border border-blue-100' },
    GENERAL: { label: 'Per Project', cls: 'bg-violet-50 text-violet-700 border border-violet-100' },
};

function getIcon(name, cls = 'w-5 h-5') {
    const Icon = ICON_MAP[name] || Box;
    return <Icon className={cls} />;
}

function getFunctionDemandBadges(func) {
    const badges = [];
    const input = Number(func?.inputChannelCount ?? 0);
    const output = Number(func?.outputChannelCount ?? 0);
    const general = Number(func?.generalChannelCount ?? 0);

    if (input > 0) badges.push({ key: 'input', label: `IN x${input}`, cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' });
    if (output > 0) badges.push({ key: 'output', label: `OUT x${output}`, cls: 'bg-blue-50 text-blue-700 border-blue-100' });
    if (general > 0) badges.push({ key: 'general', label: `GEN x${general}`, cls: 'bg-violet-50 text-violet-700 border-violet-100' });

    if (badges.length > 0) return badges;

    const fallback = String(func?.channelType || 'IN').toUpperCase();
    if (fallback === 'OUT') return [{ key: 'output-fallback', label: 'OUT x1', cls: 'bg-blue-50 text-blue-700 border-blue-100' }];
    if (fallback === 'GENERAL') return [{ key: 'general-fallback', label: 'GEN x1', cls: 'bg-violet-50 text-violet-700 border-violet-100' }];
    return [{ key: 'input-fallback', label: 'IN x1', cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' }];
}

const ScopeBadge = ({ channelType }) => {
    const { label, cls } = SCOPE_MAP[channelType] || SCOPE_MAP.IN;
    return (
        <span className={clsx('inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider', cls)}>
            {label}
        </span>
    );
};

const FunctionCard = React.memo(({ func, addedFunc, onAdd, onRemove, onQuantityChange }) => {
    const demandBadges = getFunctionDemandBadges(func);
    const isAdded = Boolean(addedFunc);

    const handleQtyBlur = (event) => {
        const quantity = Math.max(1, parseInt(event?.target?.value, 10) || 1);
        event.target.value = quantity;
        if (addedFunc) onQuantityChange(quantity);
    };

    return (
        <Card
            className={clsx(
                'relative overflow-hidden rounded-3xl border-2 transition-all duration-300',
                isAdded
                    ? 'border-primary-500 bg-primary-100 shadow-md'
                    : 'border-slate-100 bg-primary-50 hover:border-primary-200 hover:shadow-sm'
            )}
        >
            {isAdded ? <div className="absolute left-0 right-0 top-0 h-1 bg-primary-500" /> : null}

            <div className="space-y-5 p-6">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className={clsx(
                            'flex h-11 w-11 items-center justify-center rounded-xl shadow-sm transition-all',
                            isAdded ? 'bg-primary-600 text-white' : 'bg-slate-50 text-slate-400'
                        )}>
                            {getIcon(func.icon)}
                        </div>
                        <div className="min-w-0">
                            <h4 className="truncate text-sm font-bold leading-tight text-slate-900">{func.name}</h4>
                            <p className="mt-0.5 text-[10px] font-mono text-slate-400">{func.code}</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <ScopeBadge channelType={func.channelType} />
                    {demandBadges.map((badge) => (
                        <span
                            key={badge.key}
                            className={clsx('inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider', badge.cls)}
                        >
                            {badge.label}
                        </span>
                    ))}
                    {isAdded ? <Badge variant="success" className="h-4 text-[8px]">Active</Badge> : null}
                </div>

                <p className="h-8 text-xs leading-relaxed text-slate-500 line-clamp-2">{func.description}</p>

                {isAdded ? (
                    <div className="space-y-3 pt-2">
                        <div className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Quantity</span>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => {
                                        const quantity = (addedFunc.quantity || 1) - 1;
                                        if (quantity <= 0) onRemove();
                                        else onQuantityChange(quantity);
                                    }}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-primary-50 text-slate-400 shadow-sm transition-all hover:border-red-200 hover:text-red-500"
                                >
                                    <Minus className="h-3.5 w-3.5" />
                                </button>
                                <input
                                    type="number"
                                    min="1"
                                    key={`${func.id}-${addedFunc?.quantity || 1}`}
                                    defaultValue={addedFunc?.quantity || 1}
                                    onBlur={handleQtyBlur}
                                    className="w-8 bg-transparent text-center text-sm font-black text-slate-900 tabular-nums focus:outline-none"
                                />
                                <button
                                    onClick={() => onQuantityChange((addedFunc.quantity || 1) + 1)}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-primary-50 text-slate-400 shadow-sm transition-all hover:border-primary-200 hover:text-primary-600"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={onRemove}
                            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-100 text-[10px] font-bold uppercase tracking-widest text-red-500 transition-all hover:border-red-200 hover:bg-red-50"
                        >
                            <X className="h-3.5 w-3.5" />
                            Remove Function
                        </button>
                    </div>
                ) : (
                    <div className="pt-2">
                        <button
                            onClick={onAdd}
                            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-[10px] font-bold uppercase tracking-widest text-white shadow-md transition-all hover:bg-primary-600 hover:shadow-lg"
                        >
                            <Plus className="h-4 w-4" />
                            Add Function
                        </button>
                    </div>
                )}
            </div>
        </Card>
    );
});
FunctionCard.displayName = 'FunctionCard';

const SelectedFunctionCard = React.memo(({ func, onRemove, onQuantityChange }) => {
    const demandBadges = getFunctionDemandBadges(func);

    const handleQtyBlur = (event) => {
        const quantity = Math.max(1, parseInt(event?.target?.value, 10) || 1);
        event.target.value = quantity;
        onQuantityChange(quantity);
    };

    return (
        <Card className="rounded-[2rem] border border-primary-100 bg-white p-5 shadow-sm">
            <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm">
                            {getIcon(func.icon)}
                        </div>
                        <div className="min-w-0">
                            <h4 className="truncate text-sm font-bold text-slate-900">{func.name}</h4>
                            <p className="mt-0.5 text-[10px] font-mono text-slate-400">{func.code}</p>
                        </div>
                    </div>
                    <button
                        onClick={onRemove}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-500 transition-all hover:border-red-200 hover:bg-red-100"
                        title="Remove function"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <ScopeBadge channelType={func.channelType} />
                    {demandBadges.map((badge) => (
                        <span
                            key={badge.key}
                            className={clsx('inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider', badge.cls)}
                        >
                            {badge.label}
                        </span>
                    ))}
                </div>

                {func.description ? (
                    <p className="text-xs leading-relaxed text-slate-500 line-clamp-2">{func.description}</p>
                ) : null}

                <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Quantity</span>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                const quantity = (func.quantity || 1) - 1;
                                if (quantity <= 0) onRemove();
                                else onQuantityChange(quantity);
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition-all hover:border-red-200 hover:text-red-500"
                        >
                            <Minus className="h-3.5 w-3.5" />
                        </button>
                        <input
                            type="number"
                            min="1"
                            key={`${func.id}-${func.quantity || 1}`}
                            defaultValue={func.quantity || 1}
                            onBlur={handleQtyBlur}
                            className="w-10 bg-transparent text-center text-sm font-black text-slate-900 tabular-nums focus:outline-none"
                        />
                        <button
                            onClick={() => onQuantityChange((func.quantity || 1) + 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition-all hover:border-primary-200 hover:text-primary-600"
                        >
                            <Plus className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            </div>
        </Card>
    );
});
SelectedFunctionCard.displayName = 'SelectedFunctionCard';

export default function FunctionsStep() {
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
            roomTypeName: roomTypeMap.get(room.type)?.name || room.type || 'Room',
            roomCount: normalizeRoomCount(room.roomCount ?? room.count),
        }));
    }), [levels, roomTypeMap]);

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
                name: master.name || selection?.name || 'Configured Function',
                code: master.code || selection?.code || functionId,
                description: master.description || selection?.description || '',
                icon: master.icon || selection?.icon || null,
                channelType: master.channelType || selection?.channelType || 'GENERAL',
                inputChannelCount: master.inputChannelCount ?? selection?.inputChannelCount ?? 0,
                outputChannelCount: master.outputChannelCount ?? selection?.outputChannelCount ?? 0,
                generalChannelCount: master.generalChannelCount ?? selection?.generalChannelCount ?? 0,
            };
        }).filter((selection) => Boolean(selection.id));
    }, [allFunctions, currentRoom]);

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
        <div className="mx-auto max-w-7xl space-y-10 animate-fade-in pb-20">
            <div className="flex flex-col justify-between gap-8 border-b border-slate-100 pb-8 md:flex-row md:items-end">
                <SectionTitle
                    title="Select Smart Functions for Each Room"
                    subtitle="Only compatible smart functions for the selected room are shown. Products and services are calculated automatically from these room-by-room choices."
                    badge="Step 03: Smart Functions"
                />

                <div className="flex flex-shrink-0 items-center gap-6 rounded-[1.5rem] border border-slate-100 bg-primary-50 p-5 shadow-premium-sm">
                    <div className="px-2 text-center">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Functions Selected</p>
                        <p className="text-3xl font-black tabular-nums text-slate-900">{totalSelectedCount}</p>
                    </div>
                    <div className="h-10 w-px bg-slate-100" />
                    <div className="px-2 text-center">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Rooms Covered</p>
                        <p className="text-3xl font-black tabular-nums text-primary-600">{coveredRoomsCount}</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-10 xl:flex-row">
                <aside className="flex-shrink-0 space-y-6 xl:w-80">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Rooms</h3>
                        <Badge variant="neutral" className="border-none bg-slate-100 text-[8px] font-bold">
                            {allRooms.length} Total Rooms
                        </Badge>
                    </div>

                    <div className="max-h-[650px] overflow-hidden overflow-y-auto rounded-[2rem] border border-slate-100 bg-primary-100 shadow-premium-sm">
                        {levels.map((level) => {
                            const levelRooms = Array.isArray(level?.rooms) ? level.rooms : [];
                            return (
                                <div key={level.id} className="border-b border-slate-50 last:border-0">
                                    <div className="sticky top-0 z-10 flex items-center gap-2.5 border-b border-slate-100/50 bg-slate-50/50 px-5 py-4 backdrop-blur-sm">
                                        <Layers className="h-3.5 w-3.5 text-primary-500" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">{level.name}</span>
                                    </div>

                                    <div className="divide-y divide-slate-50">
                                        {levelRooms.length > 0 ? levelRooms.map((room) => {
                                            const resolvedRoom = allRooms.find((item) => item.id === room.id) || room;
                                            const isActive = activeRoomId === room.id;
                                            const functionCount = Array.isArray(room?.functions) ? room.functions.length : 0;
                                            return (
                                                <button
                                                    key={room.id}
                                                    onClick={() => setSelectedRoomId(room.id)}
                                                    className={clsx(
                                                        'group relative flex w-full items-center justify-between px-6 py-4.5 text-left transition-all',
                                                        isActive
                                                            ? 'bg-primary-600 text-white'
                                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                                    )}
                                                >
                                                    {isActive ? <div className="absolute bottom-3 left-0 top-3 w-1 rounded-r-full bg-white" /> : null}
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-3">
                                                            <div className={clsx(
                                                                'h-2 w-2 flex-shrink-0 rounded-full transition-all',
                                                                isActive ? 'bg-white' : functionCount > 0 ? 'bg-emerald-400' : 'bg-slate-200 group-hover:bg-primary-300'
                                                            )} />
                                                            <div className="min-w-0">
                                                                <span className="block truncate text-sm font-bold">{resolvedRoom.name}</span>
                                                                <span className={clsx(
                                                                    'mt-0.5 block text-[9px] font-bold uppercase tracking-widest',
                                                                    isActive ? 'text-primary-100' : 'text-slate-400'
                                                                )}>
                                                                    {resolvedRoom.roomTypeName}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="ml-3 flex flex-col items-end gap-2">
                                                        {resolvedRoom.roomCount > 1 ? (
                                                            <span className={clsx(
                                                                'rounded-lg px-2.5 py-1 text-[9px] font-black shadow-sm',
                                                                isActive ? 'bg-white/20 text-white' : 'border border-primary-100 bg-primary-50 text-primary-600'
                                                            )}>
                                                                x {resolvedRoom.roomCount}
                                                            </span>
                                                        ) : null}
                                                        {functionCount > 0 ? (
                                                            <span className={clsx(
                                                                'rounded-lg px-2.5 py-1 text-[9px] font-black shadow-sm',
                                                                isActive ? 'bg-white/20 text-white' : 'border border-emerald-100 bg-emerald-50 text-emerald-600'
                                                            )}>
                                                                {functionCount}
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                </button>
                                            );
                                        }) : (
                                            <div className="px-6 py-5 text-[11px] font-medium italic text-slate-400">No spaces configured</div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <Card className="space-y-5 rounded-[2rem] border-none bg-slate-900 p-6 shadow-xl">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-500/20">
                                <Activity className="h-4 w-4 text-primary-400" />
                            </div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Function Scope</h4>
                        </div>

                        <div className="space-y-4">
                            {Object.entries(SCOPE_MAP).map(([scope, config]) => (
                                <div key={scope} className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <div className={clsx(
                                            'h-1.5 w-1.5 rounded-full',
                                            scope === 'IN' ? 'bg-emerald-500' : scope === 'OUT' ? 'bg-blue-500' : 'bg-violet-500'
                                        )} />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">{config.label}</span>
                                    </div>
                                    <p className="pl-3.5 text-[9px] leading-relaxed text-slate-500">
                                        {scope === 'IN' ? 'Calculated for each room independently.' : scope === 'OUT' ? 'Aggregated at level before hardware selection.' : 'Aggregated once across the whole project.'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </aside>

                <main className="flex-grow space-y-8">
                    {currentRoom ? (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <Card className="group relative mb-8 overflow-hidden rounded-[2.5rem] border-none bg-primary-50 p-8 shadow-premium-sm">
                                <div className="absolute right-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary-50 opacity-40 blur-[80px] transition-transform duration-1000 group-hover:scale-110" />

                                <div className="relative z-10 flex flex-col justify-between gap-8 md:flex-row md:items-center">
                                    <div className="flex items-center gap-6">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-slate-900 shadow-lg transition-colors duration-500 group-hover:bg-primary-600">
                                            <Home className="h-8 w-8 text-white" />
                                        </div>
                                        <div>
                                            <div className="mb-1.5 flex items-center gap-3">
                                                <Badge variant="neutral" className="border-none bg-slate-100 px-3 py-1 text-[9px] font-black uppercase">
                                                    {currentRoom.levelName}
                                                </Badge>
                                                <ChevronRight className="h-4 w-4 text-slate-200" />
                                                <Badge variant="primary" className="px-3 py-1 text-[9px] font-black uppercase">
                                                    {currentRoom.roomTypeName}
                                                </Badge>
                                            </div>
                                            <h3 className="text-3xl font-black leading-none tracking-tight text-slate-900">{currentRoom.name}</h3>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-3 shadow-inner">
                                        <div className="px-4 text-right">
                                            <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-slate-400">Functions Selected</p>
                                            <p className="text-xl font-black text-slate-900">{currentRoomSelections.length}</p>
                                        </div>
                                        {currentRoom.roomCount > 1 ? (
                                            <>
                                                <div className="h-8 w-px bg-slate-200" />
                                                <div className="px-4 text-right">
                                                    <div className="mb-1.5 flex items-center justify-end gap-1.5">
                                                        <Badge variant="primary" className="h-4 text-[8px] font-black">Repeated Room Count</Badge>
                                                    </div>
                                                    <p className="text-[8px] font-black uppercase leading-none tracking-widest text-slate-400">
                                                        Function quantities are entered per room.
                                                        <br />
                                                        Repeated room count (x{currentRoom.roomCount}) is applied during calculation.
                                                    </p>
                                                </div>
                                            </>
                                        ) : null}
                                    </div>
                                </div>
                            </Card>

                            {availableFunctions.length > 0 ? (
                                <div className="mt-10 space-y-12">
                                    <section className="space-y-6">
                                        <div className="flex items-center justify-between gap-4 px-4">
                                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Selected Functions In This Room</h3>
                                            <Badge variant="neutral" className="border-none bg-slate-100 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest">
                                                {currentRoomSelections.length} Active
                                            </Badge>
                                        </div>

                                        {currentRoomSelections.length > 0 ? (
                                            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
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
                                            <Card className="rounded-[2rem] border border-dashed border-slate-200 bg-white/80 p-6 shadow-none">
                                                <p className="text-sm leading-relaxed text-slate-500">
                                                    No functions have been selected for <strong>{currentRoom.name}</strong> yet. Use the compatible function list below to add them one by one.
                                                </p>
                                            </Card>
                                        )}
                                    </section>

                                    <section className="space-y-6">
                                        <div className="flex flex-col justify-between gap-4 px-4 md:flex-row md:items-end">
                                            <div className="space-y-2">
                                                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Add Compatible Functions</h3>
                                                <p className="text-xs font-medium text-slate-500">
                                                    Only functions mapped to the selected room type are shown here.
                                                </p>
                                            </div>
                                            <Badge variant="neutral" className="border-none bg-slate-100 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest">
                                                {addableFunctions.length} Available To Add
                                            </Badge>
                                        </div>

                                        <div className="max-w-md px-4">
                                            <div className="relative">
                                                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="text"
                                                    value={functionSearch}
                                                    onChange={(event) => setFunctionSearch(event.target.value)}
                                                    placeholder="Search compatible functions..."
                                                    className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition-all focus:border-primary-300 focus:ring-4 focus:ring-primary-500/10"
                                                />
                                            </div>
                                        </div>

                                        {filteredAddableFunctions.length > 0 ? (
                                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
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
                                            <Card className="rounded-[2rem] border border-dashed border-slate-200 bg-white/80 p-6 shadow-none">
                                                <p className="text-sm leading-relaxed text-slate-500">
                                                    {addableFunctions.length === 0
                                                        ? 'All compatible functions are already added to this room.'
                                                        : 'No compatible functions match your search.'}
                                                </p>
                                            </Card>
                                        )}
                                    </section>
                                </div>
                            ) : (
                                <div className="space-y-6 rounded-[3rem] border-4 border-dashed border-slate-100 bg-slate-50/50 py-24 text-center">
                                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] border border-slate-100 bg-white shadow-premium-sm">
                                        <ShieldAlert className="h-10 w-10 text-slate-200" />
                                    </div>
                                    <div className="mx-auto max-w-md px-6">
                                        <h4 className="text-xl font-black uppercase tracking-tight text-slate-900">No compatible functions available</h4>
                                        <p className="mt-2 text-sm leading-relaxed text-slate-500">
                                            No compatible functions are available for this room type: <strong>{currentRoom.roomTypeName}</strong>.
                                        </p>
                                        <div className="pt-8">
                                            <Button variant="outline" className="gap-2 rounded-xl text-xs font-bold uppercase tracking-widest" onClick={() => setSelectedRoomId(null)}>
                                                Select Different Room
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-8 py-40 text-center animate-in fade-in zoom-in-95 duration-700">
                            <div className="group mx-auto flex h-28 w-28 items-center justify-center rounded-[2.5rem] border border-slate-100 bg-slate-50 shadow-inner">
                                <Monitor className="h-12 w-12 text-slate-200 transition-colors duration-500 group-hover:text-primary-200" />
                            </div>
                            <div className="mx-auto max-w-sm">
                                <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">Select a Room</h3>
                                <p className="mt-3 text-sm font-medium leading-relaxed text-slate-500">
                                    Choose a room from the left panel to begin assigning smart functions.
                                </p>
                            </div>
                            <div className="flex items-center justify-center gap-2 text-primary-400">
                                <Sparkles className="h-4 w-4" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Backoffice-Driven Mapping</span>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            <div className="group relative flex items-start gap-4 overflow-hidden rounded-[2.5rem] border border-slate-800 bg-slate-900 p-8 shadow-2xl">
                <div className="absolute right-0 top-0 h-32 w-32 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary-600/10 blur-2xl transition-transform duration-1000 group-hover:scale-150" />
                <div className="relative mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-500/20 text-primary-400 shadow-inner">
                    <Info className="h-6 w-6" />
                </div>
                <div className="relative z-10 space-y-2">
                    <h5 className="text-sm font-semibold uppercase tracking-widest text-white">Information</h5>
                    <p className="max-w-4xl text-sm font-medium leading-relaxed text-white">
                        You choose what each room should do. The system then calculates products, services, and totals from the backoffice master data and channel rules.
                    </p>
                </div>
            </div>
        </div>
    );
}

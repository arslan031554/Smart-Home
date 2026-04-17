import React, { useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    addFunctionToRoom,
    removeFunctionFromRoom,
    updateFunctionQuantity,
} from '../../features/configurator/configuratorSlice';
import {
    Zap, Thermometer, Shield, Monitor, Layers, Battery,
    Plus, Minus, X, Box, Camera, Key, Droplets, Waves, Sun,
    Info, Activity, AlertCircle, CheckCircle2, ChevronRight,
    Settings, Home, Sparkles, HelpCircle, ShieldAlert
} from 'lucide-react';
import { clsx } from 'clsx';
import { Badge, Card, SectionTitle, Button } from '../common/UIComponents';

// ─── Icon Resolver ─────────────────────────────────────────────────────
const ICON_MAP = {
    Sun, Thermometer, Shield, Monitor, Layers, Zap,
    Battery, Camera, Key, Droplets, Waves, Box, Activity,
};
const getIcon = (name, cls = 'w-5 h-5') => {
    const Comp = ICON_MAP[name] || Box;
    return <Comp className={cls} />;
};

// ─── Scope Badge ────────────────────────────────────────────────────────
const SCOPE_MAP = {
    IN: { label: 'Per Room', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-100' },
    OUT: { label: 'Per Level', cls: 'bg-blue-50 text-blue-700 border border-blue-100' },
    GENERAL: { label: 'Per Project', cls: 'bg-violet-50 text-violet-700 border border-violet-100' },
};

const ScopeBadge = ({ channelType }) => {
    const { label, cls } = SCOPE_MAP[channelType] || SCOPE_MAP['IN'];
    return (
        <span className={clsx('inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider', cls)}>
            {label}
        </span>
    );
};

// ─── Function Card ──────────────────────────────────────────────────────
const FunctionCard = React.memo(({ func, addedFunc, onAdd, onRemove, onQuantityChange }) => {
    const handleQtyBlur = (event) => {
        const q = Math.max(1, parseInt(event?.target?.value, 10) || 1);
        event.target.value = q;
        if (addedFunc) onQuantityChange(q);
    };

    const isAdded = !!addedFunc;

    return (
        <Card className={clsx(
            'relative overflow-hidden transition-all duration-300 border-2 rounded-3xl',
            isAdded
                ? 'border-primary-500 shadow-md bg-primary-100'
                : 'border-slate-100 bg-primary-50 hover:border-primary-200 hover:shadow-sm'
        )}>
            {/* Active indicator strip */}
            {isAdded && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-primary-500" />
            )}

            <div className="p-6 space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className={clsx(
                            'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all shadow-sm',
                            isAdded ? 'bg-primary-600 text-white' : 'bg-slate-50 text-slate-400'
                        )}>
                            {getIcon(func.icon)}
                        </div>
                        <div className="min-w-0">
                            <h4 className="font-bold text-slate-900 text-sm leading-tight truncate">{func.name}</h4>
                            <p className="text-[10px] font-mono text-slate-400 mt-0.5">{func.code}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <ScopeBadge channelType={func.channelType} />
                    {isAdded && (
                        <Badge variant="success" className="text-[8px] h-4">Active</Badge>
                    )}
                </div>

                {/* Description */}
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 h-8">{func.description}</p>

                {/* Actions */}
                {isAdded ? (
                    <div className="space-y-3 pt-2">
                        {/* Quantity control */}
                        <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-2 border border-slate-100 group">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Quantity</span>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => {
                                        const q = (addedFunc.quantity || 1) - 1;
                                        if (q <= 0) onRemove();
                                        else onQuantityChange(q);
                                    }}
                                    className="w-8 h-8 rounded-lg bg-primary-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 transition-all shadow-sm active:scale-95"
                                >
                                    <Minus className="w-3.5 h-3.5" />
                                </button>
                                <input
                                    type="number"
                                    min="1"
                                    key={`${func.id}-${addedFunc?.quantity || 1}`}
                                    defaultValue={addedFunc?.quantity || 1}
                                    onBlur={handleQtyBlur}
                                    className="w-8 text-center text-sm font-black text-slate-900 bg-transparent focus:outline-none tabular-nums"
                                />
                                <button
                                    onClick={() => onQuantityChange((addedFunc.quantity || 1) + 1)}
                                    className="w-8 h-8 rounded-lg bg-primary-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary-600 hover:border-primary-200 transition-all shadow-sm active:scale-95"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* Remove button */}
                        <button
                            onClick={onRemove}
                            className="w-full flex items-center justify-center gap-2 h-10 rounded-xl text-[10px] font-bold text-red-500 hover:bg-red-50 border border-red-100 hover:border-red-200 transition-all uppercase tracking-widest"
                        >
                            <X className="w-3.5 h-3.5" /> Remove Function
                        </button>
                    </div>
                ) : (
                    <div className="pt-2">
                        <button
                            onClick={onAdd}
                            className="w-full h-11 bg-slate-900 hover:bg-primary-600 text-white rounded-xl flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 shadow-md hover:shadow-lg"
                        >
                            <Plus className="w-4 h-4" /> Add Function
                        </button>
                    </div>
                )}
            </div>
        </Card>
    );
});
FunctionCard.displayName = 'FunctionCard';

// ─── Main Component ─────────────────────────────────────────────────────
export default function FunctionsStep() {
    const dispatch = useDispatch();
    const levelsFromStore = useSelector(state => state.configurator?.levels);
    const allFunctionsFromStore = useSelector(state => state.admin.smartFunctions);
    const [selectedRoomId, setSelectedRoomId] = useState(null);

    const levels = useMemo(
        () => (Array.isArray(levelsFromStore) ? levelsFromStore : []),
        [levelsFromStore]
    );

    const allRooms = useMemo(() => levels.flatMap((l) => {
        const rooms = Array.isArray(l?.rooms) ? l.rooms : [];
        return rooms.map((r) => ({
            ...r,
            functions: Array.isArray(r?.functions) ? r.functions : [],
            levelId: l.id,
            levelName: l.name,
        }));
    }), [levels]);

    const firstRoomId = useMemo(() => allRooms[0]?.id || null, [allRooms]);

    const activeRoomId = useMemo(() => {
        if (!selectedRoomId) {
            return firstRoomId;
        }
        if (allRooms.some((room) => room.id === selectedRoomId)) {
            return selectedRoomId;
        }
        return firstRoomId;
    }, [allRooms, firstRoomId, selectedRoomId]);

    const currentRoom = useMemo(() => allRooms.find(r => r.id === activeRoomId), [allRooms, activeRoomId]);

    // Only show smart functions compatible with this room's type (backend: roomTypes are { id, name } or IDs)
    const availableFunctions = useMemo(() => {
        if (!currentRoom) return [];
        const allFunctions = Array.isArray(allFunctionsFromStore) ? allFunctionsFromStore : [];
        const roomTypeId = currentRoom.type;
        return allFunctions.filter(fn => {
            const rts = fn.roomTypes || [];
            if (rts.length === 0) return true;
            return rts.some(rt => (rt && (rt.id === roomTypeId || rt === roomTypeId)));
        });
    }, [allFunctionsFromStore, currentRoom]);

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

    // Stats
    const totalSelectedCount = useMemo(() => levels.reduce((a, l) => {
        const rooms = Array.isArray(l?.rooms) ? l.rooms : [];
        return a + rooms.reduce((b, r) => b + (Array.isArray(r?.functions) ? r.functions.length : 0), 0);
    }, 0), [levels]);

    const coveredRoomsCount = useMemo(() => levels.reduce((a, l) => {
        const rooms = Array.isArray(l?.rooms) ? l.rooms : [];
        return a + rooms.filter((r) => Array.isArray(r?.functions) && r.functions.length > 0).length;
    }, 0), [levels]);

    return (
        <div className="space-y-10 animate-fade-in pb-20 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-slate-100">
                <SectionTitle
                    title="Select Smart Functions for Each Room"
                    subtitle="Only compatible smart functions for the selected room are shown. Products are calculated automatically from your selections."
                    badge="Step 03: Smart Functions"
                />

                <div className="flex items-center gap-6 bg-primary-50 border border-slate-100 rounded-[1.5rem] p-5 shadow-premium-sm flex-shrink-0">
                    <div className="text-center px-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Functions Selected</p>
                        <p className="text-3xl font-black text-slate-900 tabular-nums">{totalSelectedCount}</p>
                    </div>
                    <div className="w-px h-10 bg-slate-100" />
                    <div className="text-center px-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Rooms Covered</p>
                        <p className="text-3xl font-black text-primary-600 tabular-nums">{coveredRoomsCount}</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-10">
                {/* ── Room Selector Sidebar ── */}
                <aside className="xl:w-80 flex-shrink-0 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Rooms</h3>
                        <Badge variant="neutral" className="bg-slate-100 text-[8px] border-none font-bold">{allRooms.length} Total Rooms</Badge>
                    </div>

                    <div className="bg-primary-100 border border-slate-100 rounded-[2rem] overflow-hidden shadow-premium-sm max-h-[650px] overflow-y-auto">
                        {levels.map(level => {
                            const levelRooms = Array.isArray(level?.rooms) ? level.rooms : [];
                            return (
                            <div key={level.id} className="border-b last:border-0 border-slate-50">
                                {/* Level Header */}
                                <div className="flex items-center gap-2.5 px-5 py-4 bg-slate-50/50 sticky top-0 z-10 backdrop-blur-sm border-b border-slate-100/50">
                                    <Layers className="w-3.5 h-3.5 text-primary-500" />
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">{level.name}</span>
                                </div>

                                {/* Room Buttons */}
                                <div className="divide-y divide-slate-50">
                                    {levelRooms.length > 0 ? levelRooms.map(room => {
                                        const isActive = activeRoomId === room.id;
                                        const fnCount = Array.isArray(room?.functions) ? room.functions.length : 0;
                                        return (
                                            <button
                                                key={room.id}
                                                onClick={() => setSelectedRoomId(room.id)}
                                                className={clsx(
                                                    'w-full flex items-center justify-between px-6 py-4.5 text-left transition-all relative group',
                                                    isActive
                                                        ? 'bg-primary-600 text-white'
                                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                                )}
                                            >
                                                {isActive && (
                                                    <div className="absolute left-0 top-3 bottom-3 w-1 bg-white rounded-r-full" />
                                                )}
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className={clsx(
                                                        'w-2 h-2 rounded-full transition-all flex-shrink-0',
                                                        isActive ? 'bg-white' : fnCount > 0 ? 'bg-emerald-400' : 'bg-slate-200 group-hover:bg-primary-300'
                                                    )} />
                                                    <div className="min-w-0">
                                                        <span className="text-sm font-bold truncate block">{room.name}</span>
                                                        <span className={clsx('text-[9px] font-bold uppercase tracking-widest block mt-0.5', isActive ? 'text-primary-100' : 'text-slate-400')}>
                                                            {room.type?.replace(/_/g, ' ')}
                                                        </span>
                                                    </div>
                                                </div>
                                                {fnCount > 0 && (
                                                    <span className={clsx(
                                                        'text-[9px] font-black px-2.5 py-1 rounded-lg flex-shrink-0 ml-3 shadow-sm',
                                                        isActive ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                    )}>
                                                        {fnCount}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    }) : (
                                        <div className="px-6 py-5 text-[11px] text-slate-400 italic font-medium">No zones configured</div>
                                    )}
                                </div>
                            </div>
                            );
                        })}
                    </div>

                    {/* Scope Reference */}
                    <Card className="p-6 bg-slate-900 border-none shadow-xl rounded-[2rem] space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-primary-500/20 flex items-center justify-center">
                                <Activity className="w-4 h-4 text-primary-400" />
                            </div>
                            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Function Scope</h4>
                        </div>
                        <div className="space-y-4">
                            {Object.entries(SCOPE_MAP).map(([key, val]) => (
                                <div key={key} className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <div className={clsx('w-1.5 h-1.5 rounded-full', key === 'IN' ? 'bg-emerald-500' : key === 'OUT' ? 'bg-blue-500' : 'bg-violet-500')} />
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{val.label}</span>
                                    </div>
                                    <p className="text-[9px] text-slate-500 leading-relaxed pl-3.5">
                                        {key === 'IN' ? 'Calculated for this room.' : key === 'OUT' ? 'Calculated for this floor' : 'Calculated once for the project.'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </aside>

                {/* ── Available Functions ── */}
                <main className="flex-grow space-y-8">
                    {currentRoom ? (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            {/* Current Context Banner */}
                            <Card className="p-8 border-none shadow-premium-sm bg-primary-50 rounded-[2.5rem] relative overflow-hidden group mb-8">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full -mr-32 -mt-32 blur-[80px] opacity-40 group-hover:scale-110 transition-transform duration-1000" />

                                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center shadow-lg group-hover:bg-primary-600 transition-colors duration-500">
                                            <Home className="w-8 h-8 text-white" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1.5">
                                                <Badge variant="neutral" className="bg-slate-100 text-[9px] font-black border-none px-3 py-1 uppercase">{currentRoom.levelName}</Badge>
                                                <ChevronRight className="w-4 h-4 text-slate-200" />
                                                <Badge variant="primary" className="text-[9px] font-black px-3 py-1 uppercase">{currentRoom.type?.replace(/_/g, ' ')}</Badge>
                                            </div>
                                            <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none">{currentRoom.name}</h3>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100 shadow-inner">
                                        <div className="text-right px-4">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Functions Selected</p>
                                            <p className="text-xl font-black text-slate-900">{currentRoom.functions.length}</p>
                                        </div>
                                        {(parseInt(currentRoom.roomCount ?? currentRoom.count, 10) || 1) > 1 && (
                                            <>
                                                <div className="w-px h-8 bg-slate-200" />
                                                <div className="flex flex-col items-end px-4">
                                                    <div className="flex items-center gap-1.5 mb-1.5">
                                                        <Badge variant="primary" className="text-[8px] h-4 font-black">Repeated Room Count</Badge>
                                                    </div>
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none text-right">
                                                        Function quantities are entered per room.<br />
                                                        Repeated room count (×{currentRoom.count}) is applied during calculation.
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </Card>

                            {/* Direct Function Listing - NO CATEGORIES per client request */}
                            {availableFunctions.length > 0 ? (
                                <div className="space-y-12 mt-10">
                                    <div className="flex items-center justify-between px-4">
                                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Available Functions</h3>
                                        <div className="h-px bg-slate-100 flex-grow mx-8" />
                                        <Badge variant="neutral" className="bg-slate-100 text-[10px] font-black border-none px-4 py-1.5 uppercase tracking-widest">
                                            {availableFunctions.length} Functions Available
                                        </Badge>
                                    </div>

                                    {/* Function Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                                        {availableFunctions.map(func => (
                                            <FunctionCard
                                                key={`${activeRoomId || 'none'}-${func.id}`}
                                                func={func}
                                                addedFunc={currentRoom.functions.find(f => f.id === func.id)}
                                                onAdd={() => handleAdd(func)}
                                                onRemove={() => handleRemove(func.id)}
                                                onQuantityChange={qty => handleQuantityChange(func.id, qty)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="py-24 text-center border-4 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/50 space-y-6">
                                    <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mx-auto shadow-premium-sm border border-slate-100">
                                        <ShieldAlert className="w-10 h-10 text-slate-200" />
                                    </div>
                                    <div className="max-w-md mx-auto px-6">
                                        <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">No compatible functions available</h4>
                                        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                                            No compatible functions are available for this room type: <strong>{currentRoom.type?.replace(/_/g, ' ')}</strong>.
                                        </p>
                                        <div className="pt-8">
                                            <Button variant="outline" className="rounded-xl font-bold gap-2 text-xs uppercase tracking-widest" onClick={() => setSelectedRoomId(null)}>
                                                Select Different Zone
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="py-40 text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
                            <div className="w-28 h-28 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto border border-slate-100 shadow-inner group">
                                <Monitor className="w-12 h-12 text-slate-200 group-hover:text-primary-200 transition-colors duration-500" />
                            </div>
                            <div className="max-w-sm mx-auto">
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Select a Room</h3>
                                <p className="text-sm text-slate-500 mt-3 leading-relaxed font-medium">
                                    Please select a room from the left panel to begin choosing smart functions.
                                </p>
                            </div>
                            <div className="flex items-center justify-center gap-2 text-primary-400">
                                <Sparkles className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em]">AI-Assisted Mapping</span>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Engineering Note */}
            <div className="flex items-start gap-4 p-8 bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                <div className="w-12 h-12 bg-primary-500/20 rounded-2xl flex items-center justify-center text-primary-400 shrink-0 mt-0.5 shadow-inner">
                    <div className="relative">
                        <Info className="w-6 h-6" />
                        <div className="absolute inset-0 bg-primary-400 blur-sm opacity-20" />
                    </div>
                </div>
                                <div className="relative z-10 space-y-2">
                                    <h5 className="text-sm font-white text-white uppercase tracking-widest">Information</h5>
                                    <p className="text-sm text-white leading-relaxed max-w-4xl font-medium">
                                        You choose what each room should do; the system chooses the required products automatically based on your selected range and color.
                                    </p>
                                </div>
            </div>
        </div>
    );
}

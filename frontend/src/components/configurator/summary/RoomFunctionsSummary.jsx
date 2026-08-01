import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Card, Badge } from '../../common/UIComponents';
import { Layers, Home, Zap } from 'lucide-react';
import { normalizeRoomCount } from '../../../utils/configuratorNormalization';
import { useTranslation } from 'react-i18next';

function resolveFunctionSelection(selection, functionMap, fallbackName) {
    const functionId = selection?.smartFunctionId || selection?.id;
    const master = functionMap.get(functionId) || {};

    return {
        id: functionId,
        name: master.name || selection?.name || fallbackName,
        quantity: normalizeRoomCount(selection?.quantity),
    };
}
export default function RoomFunctionsSummary({ levels }) {
    const { t } = useTranslation();
    const roomTypesFromStore = useSelector((state) => state.admin.roomTypes);
    const smartFunctionsFromStore = useSelector((state) => state.admin.smartFunctions);

    const roomTypes = useMemo(
        () => (Array.isArray(roomTypesFromStore) ? roomTypesFromStore : []),
        [roomTypesFromStore]
    );

    const smartFunctions = useMemo(
        () => (Array.isArray(smartFunctionsFromStore) ? smartFunctionsFromStore : []),
        [smartFunctionsFromStore]
    );

    const roomTypeMap = useMemo(
        () => new Map(roomTypes.map((roomType) => [roomType.id, roomType])),
        [roomTypes]
    );

    const functionMap = useMemo(
        () => new Map(smartFunctions.map((smartFunction) => [smartFunction.id, smartFunction])),
        [smartFunctions]
    );

    const hasAnyRooms = Array.isArray(levels) && levels.some((level) => Array.isArray(level?.rooms) && level.rooms.length > 0);
    if (!hasAnyRooms) return null;

    return (
        <Card className="rounded-[1.25rem] border-none bg-white p-5 shadow-premium-sm sm:p-6">
            <div className="mb-8 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                        <Zap className="h-4.5 w-4.5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">{t('configurator.summary.roomsFunctions')}</h3>
                        <p className="mt-1 text-xs leading-relaxed text-slate-500">
                            {t('configurator.summary.roomsFunctionsHelp')}
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                {levels.map((level) => {
                    const levelRooms = Array.isArray(level?.rooms) ? level.rooms : [];
                    return (
                        <div key={level.id} className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Layers className="h-4 w-4 text-slate-400" />
                                <h4 className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                                    {level.name}
                                </h4>
                            </div>

                            {levelRooms.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                    {levelRooms.map((room) => {
                                        const roomTypeName = roomTypeMap.get(room.type)?.name || room.type || t('configurator.summary.room');
                                        const roomCount = normalizeRoomCount(room.roomCount ?? room.count);
                                        const roomFunctions = (Array.isArray(room.functions) ? room.functions : [])
                                            .map((selection) => resolveFunctionSelection(selection, functionMap, t('configurator.summary.configuredFunction')))
                                            .filter((selection) => Boolean(selection.id));

                                        return (
                                            <div key={room.id} className="rounded-[1.8rem] border border-slate-100 bg-slate-50/60 p-5">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex min-w-0 items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500">
                                                            <Home className="h-4.5 w-4.5" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-bold text-slate-900">{room.name || roomTypeName}</p>
                                                            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                                                {roomTypeName}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col items-end gap-2">
                                                        {roomCount > 1 ? (
                                                            <Badge variant="info" className="px-2.5 py-1 text-[9px]">
                                                                {t('configurator.summary.roomCount', { count: roomCount })}
                                                            </Badge>
                                                        ) : null}
                                                        <Badge variant="neutral" className="border-none bg-white px-2.5 py-1 text-[9px] text-slate-500">
                                                            {t('configurator.summary.functionCount', { count: roomFunctions.length })}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                <div className="mt-4">
                                                    {roomFunctions.length > 0 ? (
                                                        <div className="flex flex-wrap gap-2">
                                                            {roomFunctions.map((roomFunction) => (
                                                                <div
                                                                    key={`${room.id}-${roomFunction.id}`}
                                                                    className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-white px-3 py-1.5"
                                                                >
                                                                    <span className="text-[11px] font-semibold text-slate-700">{roomFunction.name}</span>
                                                                    <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-primary-700">
                                                                        x {roomFunction.quantity}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs italic leading-relaxed text-slate-400">
                                                            {t('configurator.summary.noRoomFunctions')}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-xs italic text-slate-400">{t('configurator.summary.noRoomsOnLevel')}</p>
                            )}
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}


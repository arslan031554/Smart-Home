import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Card, Badge } from '../../common/UIComponents';
import { Layers, Home, Zap } from 'lucide-react';
import { normalizeRoomCount } from '../../../utils/configuratorNormalization';
import { useTranslation } from 'react-i18next';
import { getActiveConfiguratorLanguage, getConfiguratorText } from '../../../utils/configuratorText';

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
    const { t, i18n } = useTranslation();
    const language = getActiveConfiguratorLanguage(i18n);
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
        <Card className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft sm:p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-700 border border-primary-100 shadow-xs">
                        <Zap className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-textPrimary">{t('configurator.summary.roomsFunctions', { defaultValue: 'Rooms & Functions' })}</h3>
                        <p className="mt-0.5 text-xs text-textSecondary">
                            {t('configurator.summary.roomsFunctionsHelp', { defaultValue: 'Review each room together with the smart functions configured inside it.' })}
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-6 max-h-[440px] sm:max-h-[520px] overflow-y-auto custom-scrollbar pr-1">
                {levels.map((level) => {
                    const levelRooms = Array.isArray(level?.rooms) ? level.rooms : [];
                    return (
                        <div key={level.id} className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Layers className="h-3.5 w-3.5 text-textSecondary" />
                                <h4 className="text-xs font-bold uppercase tracking-wider text-textSecondary">
                                    {level.name}
                                </h4>
                            </div>

                            {levelRooms.length > 0 ? (
                                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                                    {levelRooms.map((room) => {
                                        const roomTypeName = roomTypeMap.get(room.type)?.name || room.type || t('configurator.summary.room', { defaultValue: 'Room' });
                                        const roomCount = normalizeRoomCount(room.roomCount ?? room.count);
                                        const roomFunctions = (Array.isArray(room.functions) ? room.functions : [])
                                            .map((selection) => resolveFunctionSelection(selection, functionMap, t('configurator.summary.configuredFunction', { defaultValue: 'Configured Function' })))
                                            .filter((selection) => Boolean(selection.id));

                                        return (
                                            <div key={room.id} className="rounded-xl border border-slate-200/80 bg-[#f9faf6] p-4 space-y-3">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex min-w-0 items-center gap-2.5">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/80 bg-white text-textSecondary shadow-xs">
                                                            <Home className="h-4 w-4" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="truncate text-xs sm:text-sm font-bold text-textPrimary">
                                                                {getConfiguratorText(room, 'name', language, roomTypeName)}
                                                            </p>
                                                            <p className="text-[10px] font-semibold uppercase tracking-wider text-textSecondary">
                                                                {roomTypeName}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        {roomCount > 1 ? (
                                                            <Badge variant="info" className="px-2 py-0.5 text-[9px] font-bold">
                                                                {t('configurator.summary.roomCount', { count: roomCount, defaultValue: '{{count}} rooms' })}
                                                            </Badge>
                                                        ) : null}
                                                        <Badge variant="neutral" className="border-none bg-white px-2 py-0.5 text-[9px] font-bold text-textSecondary">
                                                            {t('configurator.summary.functionCount', { count: roomFunctions.length, defaultValue: '{{count}} functions' })}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                <div>
                                                    {roomFunctions.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {roomFunctions.map((roomFunction) => (
                                                                <div
                                                                    key={`${room.id}-${roomFunction.id}`}
                                                                    className="inline-flex items-center gap-1.5 rounded-md border border-slate-200/80 bg-white px-2.5 py-1 text-xs shadow-xs"
                                                                >
                                                                    <span className="text-[11px] font-semibold text-textPrimary">{roomFunction.name}</span>
                                                                    <span className="rounded bg-primary-50 px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider text-primary-700">
                                                                        × {roomFunction.quantity}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs italic text-textSecondary">
                                                            {t('configurator.summary.noRoomFunctions', { defaultValue: 'No smart functions selected for this room.' })}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-xs italic text-textSecondary">{t('configurator.summary.noRoomsOnLevel', { defaultValue: 'No rooms defined on this level.' })}</p>
                            )}
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}


import React from 'react';
import { useSelector } from 'react-redux';
import { Card } from '../../common/UIComponents';
import { Layout, Box, Layers } from 'lucide-react';
import { normalizeRoomCount } from '../../../utils/configuratorNormalization';
import { useTranslation } from 'react-i18next';
import { getActiveConfiguratorLanguage, getConfiguratorText } from '../../../utils/configuratorText';

export default function RoomsSummary({ levels }) {
    const { t, i18n } = useTranslation();
    const language = getActiveConfiguratorLanguage(i18n);
    const roomTypes = useSelector((state) => state.admin.roomTypes) || [];

    if (!levels || levels.length === 0) return null;

    return (
        <Card className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft sm:p-6">
            <div className="flex items-center gap-2.5 mb-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-700 border border-primary-100 shadow-xs">
                    <Layout className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-textPrimary">{t('configurator.summary.roomsInventory', { defaultValue: 'Spaces & Room Inventory' })}</h3>
            </div>

            <div className="space-y-5 max-h-[380px] sm:max-h-[460px] overflow-y-auto custom-scrollbar pr-1">
                {levels.map((level) => (
                    <div key={level.id} className="space-y-2.5">
                        <div className="flex items-center gap-2">
                            <Layers className="w-3.5 h-3.5 text-textSecondary" />
                            <h4 className="text-xs font-bold text-textSecondary uppercase tracking-wider">{level.name}</h4>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {level.rooms && level.rooms.length > 0 ? (
                                level.rooms.map((room) => {
                                    const typeName = roomTypes.find((roomType) => roomType.id === room.type)?.name || room.type;
                                    const roomCount = normalizeRoomCount(room.roomCount ?? room.count);
                                    return (
                                        <div key={room.id} className="flex items-center justify-between p-3 bg-[#f9faf6] border border-slate-200/80 rounded-xl group hover:bg-white hover:border-primary-200 hover:shadow-xs transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center text-textSecondary group-hover:text-primary-700 transition-colors">
                                                    <Box className="w-3.5 h-3.5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs sm:text-sm font-bold text-textPrimary leading-none mb-1">
                                                        {getConfiguratorText(room, 'name', language, typeName)}
                                                    </p>
                                                    <p className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider">{typeName}</p>
                                                </div>
                                            </div>
                                            {roomCount > 1 && (
                                                <span className="text-[10px] font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-200">
                                                    × {roomCount}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-xs text-textSecondary italic">{t('configurator.summary.noRoomsOnLevel', { defaultValue: 'No rooms defined on this level.' })}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}

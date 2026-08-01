import React from 'react';
import { useSelector } from 'react-redux';
import { Card } from '../../common/UIComponents';
import { Layout, Box, Layers } from 'lucide-react';
import { normalizeRoomCount } from '../../../utils/configuratorNormalization';
import { useTranslation } from 'react-i18next';

export default function RoomsSummary({ levels }) {
    const { t } = useTranslation();
    const roomTypes = useSelector((state) => state.admin.roomTypes) || [];

    if (!levels || levels.length === 0) return null;

    return (
        <Card className="p-5 border-none shadow-premium-sm rounded-[1.25rem] bg-white sm:p-6">
            <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                    <Layout className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{t('configurator.summary.roomsInventory')}</h3>
            </div>

            <div className="space-y-6">
                {levels.map((level) => (
                    <div key={level.id} className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Layers className="w-3.5 h-3.5 text-slate-400" />
                            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest italic">{level.name}</h4>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-5">
                            {level.rooms && level.rooms.length > 0 ? (
                                level.rooms.map((room) => {
                                    const typeName = roomTypes.find((roomType) => roomType.id === room.type)?.name || room.type;
                                    const roomCount = normalizeRoomCount(room.roomCount ?? room.count);
                                    return (
                                        <div key={room.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl group hover:bg-white hover:shadow-sm transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-primary-500 transition-colors">
                                                    <Box className="w-3 h-3" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 leading-none mb-1">{room.name}</p>
                                                    <p className="text-[10px] font-semibold text-slate-400 uppercase">{typeName}</p>
                                                </div>
                                            </div>
                                            {roomCount > 1 && (
                                                <span className="text-[11px] font-black text-primary-600 bg-primary-50 px-2 py-0.5 rounded-lg border border-primary-100">
                                                    × {roomCount}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-xs text-slate-400 font-medium italic">{t('configurator.summary.noRoomsOnLevel')}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}

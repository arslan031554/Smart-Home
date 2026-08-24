import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPortfolioProjects } from '../../features/portfolio/portfolioSlice';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import SeoHead from '../components/SeoHead';

export default function PortfolioProjectDetail() {
    const { id } = useParams();
    const dispatch = useDispatch();
    
    const { projects = [], loading } = useSelector((state) => state.portfolio || {});
    const [imageSelection, setImageSelection] = useState({ projectId: id, index: 0 });
    const currentImageIndex = imageSelection.projectId === id ? imageSelection.index : 0;
    const setCurrentImageIndex = (nextValue) => {
        setImageSelection((previous) => {
            const currentIndex = previous.projectId === id ? previous.index : 0;
            return {
                projectId: id,
                index: typeof nextValue === 'function' ? nextValue(currentIndex) : nextValue,
            };
        });
    };

    useEffect(() => {
        if (!projects || projects.length === 0) {
            dispatch(fetchPortfolioProjects());
        }
    }, [dispatch, projects]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    const projectIndex = projects.findIndex(p => p.id === id);
    const project = projects[projectIndex];
    
    const nextProject = useMemo(() => {
        if (projectIndex === -1 || projects.length <= 1) return null;
        if (projectIndex === projects.length - 1) return projects[0]; // loop to first
        return projects[projectIndex + 1];
    }, [projects, projectIndex]);

    if (loading && !project) {
        return (
            <div className="min-h-screen bg-ink flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-emerald/30 border-t-emerald rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!project && !loading) {
        return (
            <div className="min-h-screen bg-ink flex flex-col items-center justify-center text-white p-6 text-center">
                <h1 className="text-4xl font-bold mb-4">Project Not Found</h1>
                <p className="text-white/60 mb-8 max-w-md">We couldn't find the portfolio project you're looking for. It might have been removed or the URL is incorrect.</p>
                <Link to="/portofoliu" className="rounded-full bg-emerald text-ink px-8 py-4 font-bold hover:bg-white transition-colors">
                    Back to Portfolio
                </Link>
            </div>
        );
    }

    if (!project) return null;

    const images = project.images && project.images.length > 0 ? project.images : [];
    
    const nextImage = () => {
        if (images.length <= 1) return;
        setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const prevImage = () => {
        if (images.length <= 1) return;
        setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    return (
        <>
            <SeoHead title={`${project.title} - Portfolio`} description={project.result || project.description} image={images[0]} />
            
            <main className="bg-ink min-h-screen text-white pt-24 pb-20 overflow-hidden">
                {/* Header Back Button */}
                <div className="container-px py-6">
                    <Link to="/portofoliu" className="inline-flex items-center text-white/60 hover:text-emerald transition-colors font-semibold">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Portfolio
                    </Link>
                </div>

                {/* Hero Section */}
                <div className="container-px grid lg:grid-cols-[1fr_400px] gap-12 lg:gap-20 mt-4 mb-20">
                    <Motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-emerald/10 border border-emerald/20 text-emerald text-sm font-black uppercase tracking-widest mb-6">
                            {project.type}
                        </span>
                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-black leading-[1.1] tracking-tight mb-6">
                            {project.title}
                        </h1>
                        <div className="flex items-center text-white/60 text-lg mb-8">
                            <MapPin className="w-5 h-5 mr-2 text-emerald" />
                            {project.location}
                        </div>
                    </Motion.div>

                    <Motion.div 
                        className="flex flex-col justify-end"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        {project.result && (
                            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-md">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-emerald mb-3">Key Result</h3>
                                <p className="text-2xl font-bold text-white leading-tight">
                                    {project.result}
                                </p>
                            </div>
                        )}
                    </Motion.div>
                </div>

                {/* Photo Carousel */}
                {images.length > 0 && (
                    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mb-24">
                        <Motion.div 
                            className="relative aspect-[16/10] md:aspect-[21/9] bg-[#111] rounded-[2.5rem] overflow-hidden group border border-white/5 shadow-2xl"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                        >
                            <AnimatePresence initial={false} mode="wait">
                                <Motion.img
                                    key={currentImageIndex}
                                    src={images[currentImageIndex]}
                                    alt={`${project.title} - Image ${currentImageIndex + 1}`}
                                    className="absolute inset-0 w-full h-full object-cover"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                />
                            </AnimatePresence>

                            {images.length > 1 && (
                                <>
                                    <div className="absolute inset-x-0 bottom-0 p-6 md:p-10 flex justify-between items-end bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="flex gap-2">
                                            {images.map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setCurrentImageIndex(idx)}
                                                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'w-8 bg-emerald' : 'w-4 bg-white/40 hover:bg-white/70'}`}
                                                    aria-label={`Go to slide ${idx + 1}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={prevImage}
                                        className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-black/40 backdrop-blur border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-emerald hover:border-emerald hover:text-ink transition-all hover:scale-110"
                                    >
                                        <ChevronLeft className="w-8 h-8" />
                                    </button>
                                    <button 
                                        onClick={nextImage}
                                        className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-black/40 backdrop-blur border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-emerald hover:border-emerald hover:text-ink transition-all hover:scale-110"
                                    >
                                        <ChevronRight className="w-8 h-8" />
                                    </button>
                                </>
                            )}
                        </Motion.div>
                    </div>
                )}

                {/* Content Section */}
                {project.description && (
                    <div className="container-px max-w-4xl mx-auto mb-32">
                        <h2 className="text-2xl font-bold mb-6">About the project</h2>
                        <div className="prose prose-lg prose-invert prose-emerald max-w-none">
                            <p className="text-white/80 leading-relaxed whitespace-pre-wrap text-lg">
                                {project.description}
                            </p>
                        </div>
                    </div>
                )}

                {/* Next Project Footer */}
                {nextProject && (
                    <Motion.div 
                        className="container-px max-w-5xl mx-auto"
                        initial="rest"
                        whileHover="hover"
                        animate="rest"
                    >
                        <Link 
                            to={`/portofoliu/${nextProject.id}`}
                            className="block relative overflow-hidden rounded-[2.5rem] border border-white/10 group bg-[#161616]"
                        >
                            {nextProject.images?.[0] && (
                                <div className="absolute inset-0 z-0">
                                    <img src={nextProject.images[0]} alt="" className="w-full h-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-1000 group-hover:opacity-30" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-transparent z-10" />
                            
                            <div className="relative z-20 flex flex-col md:flex-row items-start md:items-center justify-between p-10 md:p-16">
                                <div>
                                    <span className="text-emerald font-bold tracking-[0.2em] uppercase text-xs mb-3 block">Next Project</span>
                                    <h3 className="text-3xl md:text-5xl font-black text-white group-hover:text-emerald transition-colors">{nextProject.title}</h3>
                                </div>
                                <div className="mt-8 md:mt-0">
                                    <Motion.div 
                                        className="w-16 h-16 rounded-full bg-emerald text-ink flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)] group-hover:shadow-[0_0_50px_rgba(16,185,129,0.6)] transition-shadow"
                                        variants={{
                                            rest: { x: 0 },
                                            hover: { x: 10 }
                                        }}
                                    >
                                        <ArrowRight className="w-8 h-8" />
                                    </Motion.div>
                                </div>
                            </div>
                        </Link>
                    </Motion.div>
                )}
            </main>
        </>
    );
}

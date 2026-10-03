import {
    Activity, ArrowRight, BrainCircuit, Eye, FileText, MessageSquareText,
    ScanSearch, ShieldCheck, Stethoscope, Target,
} from 'lucide-react';

import brunelBioinformatics from '../../assets/research/brunel-bioinformatics-symposium-2025.png';
import cedpsSymposium from '../../assets/research/cedps-symposium-2025.png';
import itedCertificate from '../../assets/research/ited-2022-certificate.jpg';
import medCtxDualBranch from '../../assets/research/med-ctx-dual-branch.png';
import medCtxFutureWork from '../../assets/research/med-ctx-future-work.png';
import medCtxInput from '../../assets/research/med-ctx-input.png';
import medCtxModelOverview from '../../assets/research/med-ctx-model-overview.png';
import medCtxOutput from '../../assets/research/med-ctx-output.png';
import medCtxResults from '../../assets/research/med-ctx-results.png';
import imedCtxResearchDirection from '../../assets/research/imed-ctx-research-direction.png';

const researchAreas = [
    { icon: BrainCircuit, title: 'Multimodal AI', description: 'Combining medical images, structured clinical descriptors and free-text clinical information within unified AI systems.' },
    { icon: Eye, title: 'Explainable AI', description: 'Developing AI systems that communicate clinically meaningful reasoning rather than returning predictions alone.' },
    { icon: ScanSearch, title: 'Medical Image Segmentation', description: 'Applying transformer-based architectures to lesion localisation and segmentation in medical imaging.' },
    { icon: ShieldCheck, title: 'Uncertainty Quantification', description: 'Modelling prediction uncertainty and confidence so AI systems can communicate how much their outputs should be trusted.' },
    { icon: Target, title: 'Computer Vision', description: 'Investigating visual representation learning, attention mechanisms and global-local feature modelling.' },
    { icon: Stethoscope, title: 'Clinical AI', description: 'Exploring clinically grounded AI systems designed around medical context, interpretability and decision support.' },
];

const medCtxCapabilities = [
    'ViT and Swin dual-branch visual encoding',
    'BioClinicalBERT clinical text encoding',
    'BI-RADS semantic integration',
    'Uncertainty-aware cross-modal attention',
    'Breast lesion segmentation',
    'Pixel-level uncertainty estimation',
    'Clinical prediction',
    'AI-generated clinical explanation',
];

const segmentationResults = [
    { value: '89.14%', label: 'Dice Score', detail: 'Segmentation performance' },
    { value: '81.69%', label: 'IoU', detail: 'Lesion overlap performance' },
    { value: '98.19%', label: 'Pixel Accuracy', detail: 'Pixel-level accuracy' },
    { value: '0.854', label: 'CLIP Alignment', detail: 'Image-text alignment' },
];

const explanationResults = [
    { value: '0.42', label: 'BLEU-4' },
    { value: '0.58', label: 'CIDEr' },
    { value: '0.39', label: 'METEOR' },
    { value: '0.84', label: 'BI-RADS Accuracy' },
];

const currentResearchSteps = [
    { number: '01', title: 'Clinician Interaction', description: 'A clinician identifies a region of interest and asks a question about a model prediction or visual feature.' },
    { number: '02', title: 'Spatial Evidence', description: 'The system extracts local visual features, attention behaviour, semantic descriptors and localised uncertainty.' },
    { number: '03', title: 'Conversational Explanation', description: 'Model evidence and the clinician query are provided to a biomedical language or vision-language model for contextual explanation.' },
    { number: '04', title: 'Multi-turn Dialogue', description: 'The clinician can ask follow-up questions about predictions, confidence, uncertainty and supporting evidence.' },
];

function Research() {
    return (
        <main className="research-page">
            <section className="research-hero">
                <div className="container research-hero-grid">
                    <div>
                        <span className="section-kicker">Research</span>
                        <h1>Building AI that can<span> see, reason and explain.</span></h1>
                    </div>
                    <div className="research-hero-copy">
                        <p>My research explores multimodal, explainable and uncertainty-aware artificial intelligence, with a particular focus on medical imaging and clinically grounded decision support.</p>
                        <p>I am interested not only in whether an AI model can make an accurate prediction, but also whether it can communicate the evidence, uncertainty and clinical context behind that prediction.</p>
                    </div>
                </div>
            </section>

            <section className="research-focus">
                <div className="container">
                    <div className="research-section-heading">
                        <div><span className="section-kicker">Research Focus</span><h2>Trustworthy intelligence for complex decisions.</h2></div>
                        <p>My work brings together computer vision, language, uncertainty modelling and clinical context.</p>
                    </div>
                    <div className="research-focus-grid">
                        {researchAreas.map(area => {
                            const Icon = area.icon;
                            return <article className="research-focus-card" key={area.title}><div className="research-focus-icon"><Icon size={29} /></div><h3>{area.title}</h3><p>{area.description}</p></article>;
                        })}
                    </div>
                </div>
            </section>

            <section className="medctx-section">
                <div className="container">
                    <div className="medctx-heading">
                        <div>
                            <span className="section-kicker">Featured Research</span>
                            <span className="research-status">Published Research</span>
                            <h2>Med-CTX</h2>
                            <h3>A Fully Transformer-Based Multimodal Framework for Explainable Breast Cancer Image Segmentation Using Radiology Reports</h3>
                        </div>
                        <div className="medctx-summary">
                            <p>Med-CTX is an end-to-end multimodal AI framework combining breast ultrasound imaging with structured BI-RADS information and unstructured clinical text.</p>
                            <p>The framework brings segmentation, uncertainty estimation, clinical prediction and explanation generation into a unified architecture.</p>
                        </div>
                    </div>

                    <div className="medctx-overview">
                        <div className="medctx-overview-copy">
                            <span className="research-small-label">System Architecture</span>
                            <h3>From multimodal input to clinical decision support.</h3>
                            <p>Medical imaging and clinical context are encoded before cross-modal fusion. The resulting representation supports lesion segmentation, clinical reasoning and uncertainty estimation.</p>
                        </div>
                        <div className="research-figure research-figure-light">
                            <span className="figure-label">Med-CTX Model Overview</span>
                            <img src={medCtxModelOverview} alt="Med-CTX model overview showing encoding, fusion and decoding stages" />
                        </div>
                    </div>

                    <div className="medctx-technical">
                        <div className="research-figure research-figure-dark">
                            <span className="figure-label">Dual-Branch Visual Encoder</span>
                            <img src={medCtxDualBranch} alt="Med-CTX ViT and Swin dual-branch visual encoder" />
                        </div>
                        <div className="medctx-capabilities">
                            <span className="research-small-label">Visual Representation</span>
                            <h3>Global and local visual information in one model.</h3>
                            <p>The visual encoder uses complementary ViT and Swin Transformer branches. Their representations are combined through adaptive fusion to capture global structure and local lesion detail.</p>
                            <div className="medctx-capability-list">
                                {medCtxCapabilities.map(capability => <div className="medctx-capability" key={capability}><span />{capability}</div>)}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="uncertainty-section">
                <div className="container uncertainty-grid">
                    <div className="uncertainty-copy">
                        <span className="section-kicker">Uncertainty Quantification</span>
                        <h2>Knowing when the model is uncertain matters.</h2>
                        <p>Uncertainty is integrated into the Med-CTX reasoning process rather than treated simply as an additional output.</p>
                        <p>Uncertainty-aware cross-modal attention helps control how visual and clinical-text information contribute to the model's reasoning, while pixel-level uncertainty maps expose ambiguous regions in the predicted segmentation.</p>
                        <div className="uncertainty-features">
                            <div><Activity size={22} /><span>Pixel-level uncertainty</span></div>
                            <div><ShieldCheck size={22} /><span>Confidence calibration</span></div>
                            <div><Eye size={22} /><span>Uncertainty-aware attention</span></div>
                        </div>
                    </div>
                    <div className="research-figure uncertainty-figure">
                        <span className="figure-label">Qualitative Model Results</span>
                        <img src={medCtxResults} alt="Med-CTX qualitative results showing predictions and uncertainty information" />
                    </div>
                </div>
            </section>

            <section className="clinical-explanation-section">
                <div className="container">
                    <div className="research-section-heading clinical-heading">
                        <div><span className="section-kicker">Explainable Clinical AI</span><h2>Predictions with clinical context.</h2></div>
                        <p>Med-CTX was designed to go beyond segmentation alone by connecting image analysis with clinical information and generated explanations.</p>
                    </div>
                    <div className="clinical-example-grid">
                        <article className="clinical-example-card"><span>Clinical Context</span><div className="clinical-example-image"><img src={medCtxInput} alt="Example clinical context supplied to Med-CTX" /></div></article>
                        <article className="clinical-example-card"><span>AI-Generated Explanation</span><div className="clinical-example-image"><img src={medCtxOutput} alt="Example explanation generated by Med-CTX" /></div></article>
                    </div>
                </div>
            </section>

            <section className="research-results">
                <div className="container">
                    <div className="research-section-heading">
                        <div><span className="section-kicker">Published Results</span><h2>Evaluated on the BUS-BRA dataset.</h2></div>
                        <p>Med-CTX was evaluated across segmentation performance, multimodal alignment, explanation quality and confidence calibration.</p>
                    </div>
                    <div className="results-grid">
                        {segmentationResults.map(result => <article className="result-card" key={result.label}><strong>{result.value}</strong><h3>{result.label}</h3><p>{result.detail}</p></article>)}
                    </div>
                    <div className="explanation-results">
                        <div className="explanation-results-copy"><span className="research-small-label">Explanation Quality</span><h3>Evaluating more than segmentation.</h3><p>The research also evaluates generated explanations and their alignment with clinical information and BI-RADS reasoning.</p></div>
                        <div className="explanation-metrics">{explanationResults.map(result => <div className="explanation-metric" key={result.label}><strong>{result.value}</strong><span>{result.label}</span></div>)}</div>
                    </div>
                </div>
            </section>

            <section className="current-research">
                <div className="container">
                    <div className="current-research-heading">
                        <div><span className="section-kicker">Current Research</span><span className="research-status research-status-active">Work in Progress</span><h2>From explainable AI to interactive AI.</h2></div>
                        <div><p>I am currently exploring how the principles developed in Med-CTX can be extended toward interactive, clinician-guided explanation.</p><p>This direction investigates how spatial evidence, uncertainty, clinical predictions and conversational AI can support questions about specific model decisions.</p></div>
                    </div>
                    <div className="current-research-visual"><span className="figure-label">Ongoing Research Concept</span><img src={medCtxFutureWork} alt="Ongoing research concept for clinician-guided conversational multimodal AI" /></div>
                    <div className="current-research-steps">{currentResearchSteps.map(step => <article className="current-research-step" key={step.number}><span>{step.number}</span><h3>{step.title}</h3><p>{step.description}</p></article>)}</div>
                    <div className="research-disclaimer"><MessageSquareText size={26} /><p>This section represents ongoing research and conceptual development. It is intentionally separated from the published Med-CTX architecture and reported experimental results.</p></div>
                </div>
            </section>

            <section className="research-publications">
                <div className="container">
                    <div className="research-section-heading">
                        <div><span className="section-kicker">Publications</span><h2>Research outputs.</h2></div>
                        <p>Peer-reviewed work spanning multimodal medical AI and computer vision.</p>
                    </div>
                    <div className="publication-list">
                        <article className="publication-item">
                            <div className="publication-year">2025</div>
                            <div className="publication-content">
                                <div className="publication-badges"><span>Conference Paper</span><span className="award-badge">Best Paper Award</span></div>
                                <h3>A Fully Transformer-Based Multimodal Framework for Explainable Breast Cancer Image Segmentation Using Radiology Reports</h3>
                                <p className="publication-authors">Enobong Adahada, Isabel Sassoon, Kate Hone and Yongmin Li</p>
                                <p>ICCVDM 2025</p>
                                <div className="publication-links">
                                    <a href="https://ieeexplore.ieee.org/document/11290557" target="_blank" rel="noreferrer" className="publication-link publication-link-primary">View on IEEE Xplore <ArrowRight size={16} /></a>
                                    <a href="https://www.researchgate.net/publication/398847954_A_Fully_Transformer-Based_Multimodal_Framework_for_Explainable_Breast_Cancer_Image_Segmentation_Using_Radiology_Reports" target="_blank" rel="noreferrer" className="publication-link">ResearchGate <ArrowRight size={16} /></a>
                                </div>
                            </div>
                        </article>
                        <article className="publication-item">
                            <div className="publication-year">2023</div>
                            <div className="publication-content">
                                <div className="publication-badges"><span>Journal Article</span></div>
                                <h3>Detection of Face-Mask in Real Time: A Cascaded Bi-Level Feature Extraction Technique Approach</h3>
                                <p className="publication-authors">Solomon Adelowo Adepoju, Enobong Thomas Adahada, Opeyemi Aderiike Abisoye and Abdumalik Danlami Mohammed</p>
                                <p>International Journal of Applied Methods in Electronics and Computers, Volume 11, Issue 4, 186-196</p>
                                <div className="publication-links">
                                    <a href="https://ijamec.org/index.php/ijamec/article/view/376/357" target="_blank" rel="noreferrer" className="publication-link publication-link-primary">View on IJAMEC page <ArrowRight size={16} /></a>
                                    <a href="https://www.researchgate.net/publication/377011936_Detection_of_Face-Mask_in_Real_Time_A_Cascaded_Bi-Level_Feature_Extraction_Technique_Approach" target="_blank" rel="noreferrer" className="publication-link">ResearchGate <ArrowRight size={16} /></a>
                                </div>
                            </div>
                        </article>
                    </div>
                </div>
            </section>

            <section className="research-presentations">
                <div className="container">
                    <div className="research-section-heading"><div><span className="section-kicker">Presentations</span><h2>Sharing the research.</h2></div><p>Research development presented through conferences and academic symposia.</p></div>
                    <div className="presentation-grid">
                        <article className="presentation-card"><div className="presentation-image">
                            <img src={cedpsSymposium} alt="CEDPS Symposium 2025 research poster" />
                        </div>
                            <div className="presentation-content">
                                <div className="presentation-icon"><FileText size={23} /></div>
                                <span>Poster Presentation - 2025</span>
                                <h3>Breast Cancer Image Segmentation using Multi-modal Transformers</h3>
                                <p>Brunel College of Engineering, Design and Physical Sciences Symposium 2025.</p></div></article>
                        <article className="presentation-card"><div className="presentation-image"><img src={brunelBioinformatics} alt="Brunel Bioinformatics Symposium 2025 presentation" /></div><div className="presentation-content"><div className="presentation-icon"><BrainCircuit size={23} /></div><span>Oral Presentation - 2025</span><h3>Unified Transformer Architecture for Breast Tumor Segmentation Across Multiple Modalities</h3><p>Brunel Bioinformatics Symposium 2025.</p></div></article>
                        <article className="presentation-card"><div className="presentation-image"><img src={itedCertificate} alt="ITED 2022 conference presentation certificate" /></div><div className="presentation-content"><div className="presentation-icon"><FileText size={23} /></div><span>Conference Presentation - 2022</span><h3>Real-Time Face Mask Detection Using Cascaded Bi-Level Feature Extraction Techniques for Access Restriction in Public Buildings</h3><p>Presented at the 5th ITED 2022 Conference, Nile University of Nigeria, Abuja.</p></div></article>
                    </div>
                </div>
            </section>

            <section className="research-direction">
                <div className="container">
                    <div className="research-direction-header">
                        <span className="section-kicker">Research Direction</span>
                    </div>

                    <div className="research-direction-grid">
                        <div className="research-direction-visual">
                            <img
                                src={imedCtxResearchDirection}
                                alt="Conceptual iMed-CTX research direction showing multimodal 3D medical imaging, spatial evidence, uncertainty-aware AI and clinician interaction"
                            />
                        </div>

                        <div className="research-direction-copy">
                            <h2>
                                AI should not only produce a result;
                                <span>
                                    it should help us understand how it made its decisions,
                                    and how certain it is.
                                </span>
                            </h2>

                            <p>
                                My continuing research explores how multimodal representation,
                                uncertainty quantification and conversational explanation can
                                contribute to more transparent, trustworthy and clinically useful
                                AI systems.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default Research;

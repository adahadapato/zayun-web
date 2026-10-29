import type { IconType } from 'react-icons'
import { FaGlobe, FaLink, FaLinkedinIn } from 'react-icons/fa'
import {
  SiAcademia, SiArxiv, SiDblp, SiGithub, SiGooglescholar, SiHuggingface, SiIeee, SiKaggle, SiMedium, SiOrcid,
  SiResearchgate, SiScopus, SiSemanticscholar, SiStackoverflow, SiX, SiYoutube, SiZenodo,
} from 'react-icons/si'
import type { ProfilePlatform } from '../../api/contracts/enums'

const ICONS: Record<ProfilePlatform, IconType> = {
  Orcid: SiOrcid,
  ResearchGate: SiResearchgate,
  GoogleScholar: SiGooglescholar,
  Arxiv: SiArxiv,
  Ieee: SiIeee,
  Scopus: SiScopus,
  SemanticScholar: SiSemanticscholar,
  Dblp: SiDblp,
  Zenodo: SiZenodo,
  Academia: SiAcademia,
  LinkedIn: FaLinkedinIn,
  GitHub: SiGithub,
  HuggingFace: SiHuggingface,
  Kaggle: SiKaggle,
  StackOverflow: SiStackoverflow,
  X: SiX,
  YouTube: SiYoutube,
  Medium: SiMedium,
  Website: FaGlobe,
  Other: FaLink,
}

/** The logo of a profile's site (a plain link icon for sites without one). Decorative: pair it with the name. */
export function ProfileIcon({ platform, size = 18 }: { platform: ProfilePlatform; size?: number }) {
  const Icon = ICONS[platform] ?? FaLink
  return <Icon size={size} aria-hidden="true" />
}

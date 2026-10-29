/**
 * The API's enums, as the names it sends and accepts in JSON ("Featured", not 1).
 * Keep in step with Zayun.Domain/Enums.
 */

/** Which list a project appears in on the Projects page. */
export type ProjectCategory = 'Featured' | 'Engineering'

/** How a project picture is used on its card. */
export type ProjectImageKind = 'Primary' | 'Secondary' | 'Gallery'

/** What kind of research output a publication is. */
export type PublicationType = 'ConferencePaper' | 'JournalArticle' | 'BookChapter' | 'Preprint' | 'Thesis'

/** How research was presented. */
export type PresentationType = 'Poster' | 'Oral' | 'Conference' | 'InvitedTalk' | 'Workshop'

/** What a Contact message is about. */
export type ContactTopic = 'Project' | 'Research' | 'Opportunity' | 'Speaking' | 'Other'

/** What a typed tag turned out to be: already a tag, a new one, or doubtful (the AI doesn't think it's a skill). */
export type TagCheckStatus = 'Existing' | 'New' | 'Doubtful'

/** Which site an online profile is on (picks the icon). */
export type ProfilePlatform =
  | 'Orcid' | 'ResearchGate' | 'GoogleScholar' | 'Arxiv' | 'Ieee' | 'Scopus' | 'SemanticScholar' | 'Dblp' | 'Zenodo'
  | 'Academia'
  | 'LinkedIn' | 'GitHub' | 'HuggingFace' | 'Kaggle' | 'StackOverflow' | 'X' | 'YouTube' | 'Medium'
  | 'Website' | 'Other'

/** Which tags Admin → Tags shows. */
export type TagFilter = 'All' | 'Used' | 'Unused'

/** How Admin → Tags is sorted. */
export type TagSort = 'Name' | 'Usage'

/** Where a Contact message is in the inbox. */
export type ContactMessageStatus = 'New' | 'Replied' | 'Closed'

/** What kind of private document it is. */
export type DocumentCategory = 'Cv' | 'Certificate' | 'Transcript' | 'Paper' | 'Identity' | 'Contract' | 'Other'

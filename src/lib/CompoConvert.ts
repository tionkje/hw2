import { CompetitionData, Competition } from './Competition';

type Height = number;
type OldCategoryId = string;
type OldJudge = 'X' | 'V' | 'S';
type OldAttempts = [OldJudge, OldJudge, OldJudge];

type OldThrowerData = {
  name: string;
  categoryid: OldCategoryId;
  startHeight: Height;
  hwId: number;
  nr: number;
  rugnr: number;
  attempts: Record<Height, OldAttempts>;
  skipHeight: Height;
  eliminated: Height;
  rankNr: number;
};

type OldCategoryData = {
  name: string;
  id: string;
  startHeight: Height;
};

type OldCompetitionData = {
  name: string;
  throwers: Array<OldThrowerData>;
  categories: Record<string, OldCategoryData>;
};

export default function CompoConvert(old: OldCompetitionData): Competition {
  const compo: CompetitionData = {};
  compo.name = old.name;

  return new Competition(compo);
}

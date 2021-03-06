import * as BbPromise from "bluebird";
import * as _ from "lodash";

import { CandidateItem, DataSource, MOOD, WEATHER, BOT } from "./candidate_sources/base";
import { RelatedTrackDataSource } from "./candidate_sources/related_tracks";

export class Suggester {
  private sources: Array<DataSource<CandidateItem>>;

  constructor(
    private mood: MOOD,
    private weather: WEATHER,
    private bot: BOT,
    private clientId: string,
  ) {
    this.sources = [
      new RelatedTrackDataSource(this.mood, this.weather, this.bot, this.clientId),
    ];
  }

  public async suggest(count: number = 100) {
    const candidates = await BbPromise.map(this.sources, (source) => source.fetch());

    return _(candidates)
      .flatten<CandidateItem>()
      .uniqBy((item) => item.id)
      .sortBy((item) => -item.score)
      .slice(0, count)
      .value();
  }
}

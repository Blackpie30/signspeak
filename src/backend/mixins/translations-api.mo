import List "mo:core/List";
import Types "../types/translations";
import TranslationsLib "../lib/translations";

mixin (
  translations : TranslationsLib.TranslationList,
  state : { var nextId : Types.TranslationId },
) {
  /// Save a new translation result and return its id.
  public func addTranslation(
    text : Text,
    confidence : Float,
    timestamp : Int,
  ) : async Types.TranslationId {
    TranslationsLib.add(translations, state, text, confidence, timestamp);
  };

  /// Return the most recent 20 translations.
  public query func getRecentTranslations() : async [Types.Translation] {
    TranslationsLib.listRecent(translations);
  };

  /// Delete a single translation entry by id.
  public func deleteTranslation(id : Types.TranslationId) : async Bool {
    TranslationsLib.deleteById(translations, id);
  };

  /// Delete all translation history.
  public func clearTranslations() : async () {
    TranslationsLib.clearAll(translations);
  };
};

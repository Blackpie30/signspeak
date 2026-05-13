import List "mo:core/List";
import Types "../types/translations";

module {
  public type TranslationList = List.List<Types.Translation>;

  /// Initialize a new empty translation list.
  public func empty() : TranslationList {
    List.empty<Types.Translation>();
  };

  /// Add a new translation entry. Returns the assigned id.
  public func add(
    self : TranslationList,
    state : { var nextId : Types.TranslationId },
    text : Text,
    confidence : Float,
    timestamp : Int,
  ) : Types.TranslationId {
    let id = state.nextId;
    state.nextId += 1;
    let entry : Types.Translation = { id; text; confidence; timestamp };
    self.add(entry);
    id;
  };

  /// Return up to the last 20 translation entries, newest first.
  public func listRecent(self : TranslationList) : [Types.Translation] {
    let total = self.size();
    let start : Int = if (total > 20) { total - 20 } else { 0 };
    let slice = self.sliceToArray(start, total.toInt());
    slice.reverse();
  };

  /// Delete a single translation by id. Returns true if found and removed.
  public func deleteById(
    self : TranslationList,
    id : Types.TranslationId,
  ) : Bool {
    let before = self.size();
    let kept = self.filter(func(t) { t.id != id });
    let found = kept.size() < before;
    self.clear();
    self.append(kept);
    found;
  };

  /// Remove all translation entries.
  public func clearAll(self : TranslationList) : () {
    self.clear();
  };
};

module {
  public type TranslationId = Nat;

  public type Translation = {
    id : TranslationId;
    text : Text;
    confidence : Float;
    timestamp : Int;
  };
};

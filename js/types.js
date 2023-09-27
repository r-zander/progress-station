class EffectType {
  constructor(description) {
    this.description = description
  }

  static Population = new EffectType("Boosts population description")
  static Energy = new EffectType("Boosts energy")
}
class EffectType {
  constructor(application, description) {
    this.operator = application
    this.description = description
  }

  static Population = new EffectType('x','Population')
  static Energy = new EffectType('+', 'Energy')
}
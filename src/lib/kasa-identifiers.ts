/**
 * Educational identifier substitution only: Kasa's reserved grammar remains unchanged.
 * Never edit text inside quoted strings, # comments, or other source tokens.
 * This is a UI view of CMS content, not a destructive data migration.
 */
export const identifierExamples: Record<string,Record<string,string>> = {
  welcome: {},
  install: {},
  hello: {},
  variables: {edin:'din'},
  types: {},
  arithmetic: {a:'sika_a',b:'sika_b'},
  logic: {age:'mfe',has_card:'wɔ_kaad'},
  conditions: {score:'sɔhwɛ_score'},
  repeat: {total:'sika_total'},
  while: {n:'nɔma_count'},
  functions: {revenue:'sika_sales',cost:'sika_cost'},
  recursion: {factorial:'fa_kɔso'},
  lists: {prices:'nneɛma_prices'},
  'list-update': {amounts:'sika_amounts'},
  input: {edin:'din'},
  errors: {a:'sika_a',b:'sika_b'},
  savings: {goal:'sika_goal',monthly:'sika_monthly',current:'sika_saved',months:'bosome_count'},
  grades: {marks:'sɔhwɛ_marks',total:'sɔhwɛ_total'},
  inventory: {revenue:'sika_sales',cogs:'sika_cogs',products:'nneɛma'},
  sorting: {values:'nɔma_values'},
  'market-profit': {revenue:'sika_sales',cost:'sika_cost',profit:'mfaso',margin:'mfaso_margin'},
  'student-average': {maths:'akontaabu',science:'science',english:'english',average:'sɔhwɛ_average'},
  'stock-reorder': {opening:'nneɛma_open',sold:'nneɛma_sold',remaining:'nneɛma_left'},
  'saving-target': {total:'sika_total'},
}
const isStart = (ch:string) => /[\p{L}_]/u.test(ch)
const isPart = (ch:string) => /[\p{L}\p{N}_]/u.test(ch)
export function renameKasaIdentifiers(source:string, replacements:Record<string,string>):string {
  let out=''
  let index=0
  while(index<source.length){
    const ch=source[index]
    if(ch==='#'){
      const end=source.indexOf('\n',index)
      if(end===-1){out+=source.slice(index);break}
      out+=source.slice(index,end)
      index=end
      continue
    }
    if(ch==='"'||ch==="'"){
      const quote=ch
      const start=index++
      while(index<source.length){
        if(source[index]==='\\'){index+=2;continue}
        if(source[index++]===quote)break
      }
      out+=source.slice(start,index)
      continue
    }
    const cp=String.fromCodePoint(source.codePointAt(index)!)
    if(isStart(cp)){
      const start=index
      index+=cp.length
      while(index<source.length){
        const next=String.fromCodePoint(source.codePointAt(index)!)
        if(!isPart(next))break
        index+=next.length
      }
      const name=source.slice(start,index)
      out+=Object.prototype.hasOwnProperty.call(replacements,name)?replacements[name]:name
      continue
    }
    out+=ch
    index++
  }
  return out
}
export function bilingualLessonCode(slug:string, original:string) {
  const substitutions=identifierExamples[slug]||{}
  const blended=renameKasaIdentifiers(original,substitutions)
  return {blended,hasVariant:blended!==original}
}

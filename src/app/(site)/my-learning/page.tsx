import Link from 'next/link'
import {lessons,modules} from '@/lib/content'
import {LearningProgress,type ProgressLesson} from '@/components/LearningProgress'
import {CourseProgress,type CourseGroup} from '@/components/CourseProgress'
import foundations from '@/lib/beginner-course.json'
import syntax from '@/lib/syntax-course.json'
import algorithms from '@/lib/algorithms-course.json'
import data from '@/lib/data-course.json'
import applied from '@/lib/applied-course.json'
import development from '@/lib/development-course.json'

export const dynamic='force-dynamic'
export const metadata={title:'My learning progress',description:'Device-local lesson progress for Kasa Academy. No account or grading required.'}

const catalog:CourseGroup[]=[
 {id:'foundations',title:'Computing Foundations',href:'/start',
  lessons:foundations.units.map(u=>({id:'start/'+u.id,href:'/start/'+u.id,title:u.title,minutes:u.minutes,course:'foundations'}))},
 {id:'syntax',title:'Kasa Language Fundamentals',href:'/learn/syntax',
  lessons:syntax.units.map(u=>({id:'syntax/'+u.slug,href:'/learn/syntax/'+u.slug,title:u.title,minutes:u.minutes,course:'syntax'}))},
 {id:'algorithms',title:'Algorithms',href:'/learn/algorithms',
  lessons:algorithms.units.map(u=>({id:'algorithms/'+u.slug,href:'/learn/algorithms/'+u.slug,title:u.title,minutes:u.minutes,course:'algorithms'}))},
 {id:'data',title:'Data Processing',href:'/learn/data',
  lessons:data.units.map(u=>({id:'data/'+u.slug,href:'/learn/data/'+u.slug,title:u.title,minutes:u.minutes,course:'data'}))},
 {id:'applied',title:'Applied Kasa Programming',href:'/learn/applied',
  lessons:applied.units.map(u=>({id:'applied/'+u.slug,href:'/learn/applied/'+u.slug,title:u.title,minutes:u.minutes,course:'applied'}))},
 {id:'development',title:'Software Development Practices',href:'/learn/development',
  lessons:development.units.map(u=>({id:'development/'+u.slug,href:'/learn/development/'+u.slug,title:u.title,minutes:u.minutes,course:'development'}))}
]
export default async function MyLearningPage(){
 const [published,groups]=await Promise.all([lessons(),modules()])
 const names=new Map(groups.map(group=>[String(group.id),group.title]))
 const cms:ProgressLesson[]=published.map(lesson=>({
  slug:lesson.slug,title:lesson.title,
  module:typeof lesson.module==='object'&&lesson.module!==null
   ?lesson.module.title:names.get(String(lesson.module))||'Kasa lessons',
  duration:Math.max(1,Number(lesson.durationMinutes)||5)
 }))
 return <main className="content-width">
  <header className="page-heading"><span className="eyebrow">MY LEARNING · FREE AND SELF-PACED</span><h1>Pick up where you left off</h1>
   <p>View your progress across Kasa courses and original CMS lessons, then continue studying. All progress is stored on this device only.</p>
   <p><Link href="/learn">Browse the eight-stage learning path →</Link> · <Link href="/start">Start from zero →</Link></p>
  </header>
  <CourseProgress courses={catalog}/>
  <LearningProgress lessons={cms}/>
 </main>
}

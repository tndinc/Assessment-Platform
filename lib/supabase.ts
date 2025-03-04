import { createClient } from "@supabase/supabase-js"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase = createClient(supabaseUrl, supabaseKey)

// Type definitions based on your database schema
export type AdminAccount = {
  id: string
  admin_user: string
  admin_psw: string
}

export type CheatingLog = {
  id: string
  user_id: string
  exam_id: string
  copy_percentage: number
  time_spent_away: number
  cheat_risk_level: string
  timestamp: string
}

export type Course = {
  course_id: string
  course_name: string
  no_of_students: number
}

export type ExamSubmission = {
  submission_id: string
  user_id: string
  exam_id: string
  submission_date: string
  time_spent: number
  answers: any
  status: string
  created_at: string
}

export type Exam = {
  exam_id: string
  course_id: string
  exam_title: string
  exam_desc: string
  exam_time_limit: number
  exam_points: number
  exam_created_by: string
  exam_time_created: string
  status: string
  subject: string
  deadline: string
}

export type Profile = {
  id: string
  full_name: string
  email: string
  avatar_url: string
  user_section: string
  status: string
}

export type Question = {
  id: string
  question_txt: string
  exam_id: string
  type: string
  points: number
  question_type: string
  initial_code: string
  metrics: any
  question_answer: string
}

export type StudentFeedback = {
  id: string
  user_id: string
  exam_id: string
  total_score: number
  max_score: number
  feedback_data: any
  metrics_data: any
  created_at: string
  submission_id: string
}

// Data fetching functions
export async function fetchProfiles() {
  const { data, error } = await supabase.from("synthetic_profiles").select("*")

  if (error) {
    console.error("Error fetching profiles:", error)
    return []
  }

  return data
}

export async function fetchCourses() {
  const { data, error } = await supabase.from("course_tbl").select("*")

  if (error) {
    console.error("Error fetching courses:", error)
    return []
  }

  return data
}

export async function fetchExams() {
  const { data, error } = await supabase.from("exam_tbl").select("*")

  if (error) {
    console.error("Error fetching exams:", error)
    return []
  }

  return data
}

// Function to fetch the total number of exams
export async function fetchTotalExams() {
  const supabase = createClientComponentClient()
  console.log("Fetching total number of exams...")

  const { count, error } = await supabase
    .from("exam_tbl")
    .select("*", { count: "exact", head: true })

  if (error) {
    console.error("Error fetching total number of exams:", error)
    return 0
  }

  console.log("Total number of exams:", count)
  return count
}

export async function fetchExamSubmissions() {
  const { data, error } = await supabase.from("synthetic_submissions").select("*")

  if (error) {
    console.error("Error fetching exam submissions:", error)
    return []
  }

  return data
}

export async function fetchCheatingLogs() {
  const { data, error } = await supabase.from("cheating_logs").select("*")

  if (error) {
    console.error("Error fetching cheating logs:", error)
    return []
  }

  return data
}

export async function fetchStudentFeedback() {
  const { data, error } = await supabase.from("synthetic_feedback").select("*")

  if (error) {
    console.error("Error fetching student feedback:", error)
    return []
  }

  return data
}

export async function fetchQuestions() {
  const { data, error } = await supabase.from("question_tbl2").select("*")

  if (error) {
    console.error("Error fetching questions:", error)
    return []
  }

  return data
}

export async function fetchSections() {
  const { data, error } = await supabase
    .from('profiles')
    .select('user_section')
    .distinct()

  if (error) {
    console.error('Error fetching sections:', error)
    return []
  }

  return data.map((profile) => profile.user_section)
}

// Fetch student performance data with related profile information
export async function fetchStudentPerformanceData() {
  const supabase = createClientComponentClient()
  console.log("Fetching student performance data...")

  // Fetch the total number of exams
  const totalExams = await fetchTotalExams()

  // Fetch profiles, exam submissions, and student feedback
  const { data: profiles, error: profilesError } = await supabase.from("synthetic_profiles").select("*")
  const { data: submissions, error: submissionsError } = await supabase.from("synthetic_submissions").select("*")
  const { data: feedback, error: feedbackError } = await supabase.from("synthetic_feedback").select("*")
  
  if (profilesError || submissionsError || feedbackError) {
    console.error("Error fetching data:", { profilesError, submissionsError, feedbackError })
    return []
  }
    
  // Combine the data to create student performance metrics
  const studentPerformance = profiles.map((profile) => {
    const studentSubmissions = submissions.filter((sub) => sub.user_id === profile.id)
    const studentFeedback = feedback.filter((fb) => fb.user_id === profile.id)
  
    const totalScore = studentFeedback.reduce((sum, fb) => sum + (fb.total_score || 0), 0)
    const totalMaxScore = studentFeedback.reduce((sum, fb) => sum + (fb.max_score || 0), 0)
    const avgScore = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0
  
    const engagement =
      studentSubmissions.length > 0 && totalExams > 0
        ? Math.min(Math.round((studentSubmissions.length / totalExams) * 100), 100)
        : 0
  
    let risk = "low"
    if (avgScore < 60 || engagement < 50) risk = "high"
    else if (avgScore < 75 || engagement < 70) risk = "medium"

    const sortedFeedback = [...studentFeedback].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    let trend = "stable"
    if (sortedFeedback.length >= 2) {
      const recent = sortedFeedback[0].total_score / sortedFeedback[0].max_score
      const previous = sortedFeedback[1].total_score / sortedFeedback[1].max_score
      if (recent > previous) trend = "up"
      else if (recent < previous) trend = "down"
    }

    let lastActive = "Never"
    if (studentSubmissions.length > 0) {
      const latestSubmission = studentSubmissions.reduce((latest, sub) =>
        new Date(sub.created_at) > new Date(latest.created_at) ? sub : latest,
      )
      const submissionDate = new Date(latestSubmission.created_at)
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - submissionDate.getTime())
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      lastActive =
        diffDays > 0
          ? `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
          : `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
    }

    return {
      id: profile.id,
      name: profile.full_name,
      section: profile.user_section,
      avatar: profile.avatar_url || "/placeholder.svg?height=40&width=40",
      score: avgScore,
      engagement,
      risk,
      trend,
      lastActive,
    }
  })

  console.log("Processed student performance data:", studentPerformance)
  return studentPerformance
}

// Fetch analytics data
export async function fetchAnalyticsData() {
  const supabase = createClientComponentClient()
  console.log("Fetching analytics data...")

  const { data: exams, error: examsError } = await supabase.from("exam_tbl").select("*")
  const { data: feedback, error: feedbackError } = await supabase.from("synthetic_feedback").select("*")
  const { data: profiles, error: profilesError } = await supabase.from("synthetic_profiles").select("*")

  if (examsError || feedbackError || profilesError) {
    console.error("Error fetching data:", { examsError, feedbackError, profilesError })
    return { performanceOverTime: [], topicPerformance: [] }
  }

  // Get unique sections
  const sections = [...new Set(profiles.map((profile) => profile.user_section))]

  // Calculate performance over time
  const performanceOverTime = exams
    .sort((a, b) => new Date(a.exam_time_created).getTime() - new Date(b.exam_time_created).getTime())
    .map((exam) => {
      const examFeedback = feedback.filter((fb) => fb.exam_id === exam.exam_id)

      const overallScore = calculateAverageScore(examFeedback)
      const result = {
        name: exam.exam_title,
        "Class Average": overallScore,
      }

      // Calculate scores for each section
      sections.forEach((section) => {
        const sectionFeedback = examFeedback.filter((fb) => {
          const student = profiles.find((p) => p.id === fb.user_id)
          return student && student.user_section === section
        })
        result[`Section ${section}`] = calculateAverageScore(sectionFeedback)
      })

      return result
    })

  // Calculate performance by topic (subject)
  const topicPerformance = []
  const subjectScores = {}

  feedback.forEach((fb) => {
    const exam = exams.find((e) => e.exam_id === fb.exam_id)
    if (exam) {
      if (!subjectScores[exam.subject]) {
        subjectScores[exam.subject] = { totalScore: 0, totalMaxScore: 0 }
      }
      subjectScores[exam.subject].totalScore += fb.total_score || 0
      subjectScores[exam.subject].totalMaxScore += fb.max_score || 0

      // Calculate scores for each section
      const student = profiles.find((p) => p.id === fb.user_id)
      if (student) {
        const section = student.user_section
        if (!subjectScores[exam.subject][`Section ${section}`]) {
          subjectScores[exam.subject][`Section ${section}`] = { totalScore: 0, totalMaxScore: 0 }
        }
        subjectScores[exam.subject][`Section ${section}`].totalScore += fb.total_score || 0
        subjectScores[exam.subject][`Section ${section}`].totalMaxScore += fb.max_score || 0
      }
    }
  })

  for (const [subject, scores] of Object.entries(subjectScores)) {
    const avgScore = calculateAverageScore([{ total_score: scores.totalScore, max_score: scores.totalMaxScore }])
    const topicData = { name: subject, value: avgScore }

    // Add section-specific scores
    sections.forEach((section) => {
      const sectionScores = scores[`Section ${section}`]
      if (sectionScores) {
        const sectionAvg = calculateAverageScore([
          { total_score: sectionScores.totalScore, max_score: sectionScores.totalMaxScore },
        ])
        topicData[`Section ${section}`] = sectionAvg
      } else {
        topicData[`Section ${section}`] = 0
      }
    })

    topicPerformance.push(topicData)
  }

  console.log("Processed analytics data:", { performanceOverTime, topicPerformance })
  return { performanceOverTime, topicPerformance }
}

// Helper function to calculate average score
function calculateAverageScore(feedbackArray) {
  const totalScore = feedbackArray.reduce((sum, fb) => sum + (fb.total_score || 0), 0)
  const totalMaxScore = feedbackArray.reduce((sum, fb) => sum + (fb.max_score || 0), 0)
  return totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0
}

// Fetch upcoming exams for calendar
export async function fetchUpcomingExams() {
  const supabase = createClientComponentClient()
  console.log("Fetching upcoming exams...")

  const { data, error } = await supabase
    .from("exam_tbl")
    .select("*")
    .gt("deadline", new Date().toISOString())
    .order("deadline", { ascending: true })

  if (error) {
    console.error("Error fetching upcoming exams:", error)
    return []
  }

  const upcomingExams = data.map((exam) => ({
    date: new Date(exam.deadline),
    title: exam.exam_title,
    type: "exam",
  }))

  console.log("Processed upcoming exams:", upcomingExams)
  return upcomingExams
}

// Add a new function to fetch class statistics
export async function fetchClassStatistics() {
  const supabase = createClientComponentClient()
  console.log("Fetching class statistics...")

  const { data: profiles, error: profilesError } = await supabase.from("synthetic_profiles").select("*")
  const { data: feedback, error: feedbackError } = await supabase.from("synthetic_feedback").select("*")

  if (profilesError || feedbackError) {
    console.error("Error fetching data:", { profilesError, feedbackError })
    return null
  }

  const totalStudents = profiles.length
  const activeStudents = profiles.filter((p) => p.status === "active").length

  const totalScore = feedback.reduce((sum, fb) => sum + (fb.total_score || 0), 0)
  const totalMaxScore = feedback.reduce((sum, fb) => sum + (fb.max_score || 0), 0)
  const classAverage = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0

  const studentAverages = profiles.map((profile) => {
    const studentFeedback = feedback.filter((fb) => fb.user_id === profile.id)
    const totalScore = studentFeedback.reduce((sum, fb) => sum + (fb.total_score || 0), 0)
    const totalMaxScore = studentFeedback.reduce((sum, fb) => sum + (fb.max_score || 0), 0)
    return totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0
  })

  const atRiskCount = studentAverages.filter((avg) => avg < 60).length
  const masteryCount = studentAverages.filter((avg) => avg >= 90).length

  const statistics = {
    totalStudents,
    activeStudents,
    classAverage,
    atRiskCount,
    masteryCount,
  }

  console.log("Processed class statistics:", statistics)
  return statistics
}

// Fetch student rankings by exam
export async function fetchStudentRankingsByExam(examId: string) {
  const profiles = await fetchProfiles()
  const feedback = await fetchStudentFeedback()

  // Get feedback for the specified exam
  const examFeedback = feedback.filter((fb) => fb.exam_id === examId)

  // Create ranking data
  const rankings = examFeedback.map((fb) => {
    const profile = profiles.find((p) => p.id === fb.user_id)

    return {
      id: fb.user_id,
      name: profile ? profile.full_name : "Unknown Student",
      avatar: profile?.avatar_url || "/placeholder.svg?height=40&width=40",
      score: Math.round((fb.total_score / fb.max_score) * 100),
      // We'll calculate rank and trend later
      rank: 0,
      previousRank: 0,
      trend: "stable",
    }
  })

  // Sort by score and assign ranks
  rankings.sort((a, b) => b.score - a.score)
  rankings.forEach((student, index) => {
    student.rank = index + 1
    // For previous rank, we'd need historical data, but for now we'll simulate it
    student.previousRank = Math.max(1, student.rank + (Math.random() > 0.5 ? 1 : -1))

    if (student.previousRank < student.rank) {
      student.trend = "down"
    } else if (student.previousRank > student.rank) {
      student.trend = "up"
    } else {
      student.trend = "stable"
    }
  })

  return rankings
}
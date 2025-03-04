import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

// Fetch student performance data
export async function fetchStudentPerformanceData() {
  try {
    // Fetch profiles with student feedback data
    const { data: profiles, error: profilesError } = await supabase
      .from("synthetic_profiles")
      .select("id, full_name, email, avatar_url, user_section, status")
      .eq("status", "active")

    if (profilesError) throw profilesError

    // Fetch student feedback data
    const { data: feedback, error: feedbackError } = await supabase
      .from("synthetic__feedback")
      .select("user_id, total_score, max_score, feedback_data, metrics_data, created_at, submission_id")

    if (feedbackError) throw feedbackError

    // Fetch cheating logs
    const { data: cheatingLogs, error: cheatingLogsError } = await supabase
      .from("cheating_logs")
      .select("user_id, exam_id, copy_percentage, time_spent_away, cheat_risk_level, timestamp")

    if (cheatingLogsError) throw cheatingLogsError

    // Fetch exam submissions
    const { data: examSubmissions, error: examSubmissionsError } = await supabase
      .from("synthetic__submissions")
      .select("user_id, exam_id, submission_date, time_spent, status")

    if (examSubmissionsError) throw examSubmissionsError

    // Process and combine data
    const studentData = profiles.map((profile) => {
      // Get all feedback for this student
      const studentFeedback = feedback.filter((f) => f.user_id === profile.id)

      // Calculate average score
      const totalScore = studentFeedback.reduce((sum, f) => sum + (f.total_score / f.max_score) * 100, 0)
      const averageScore = studentFeedback.length > 0 ? Math.round(totalScore / studentFeedback.length) : 0

      // Get student's cheating logs
      const studentCheatingLogs = cheatingLogs.filter((log) => log.user_id === profile.id)

      // Determine risk level based on cheating logs and scores
      let riskLevel = "low"
      if (studentCheatingLogs.length > 0 || averageScore < 60) {
        riskLevel = "high"
      } else if (averageScore < 75) {
        riskLevel = "medium"
      }

      // Calculate engagement based on submissions and activity
      const studentSubmissions = examSubmissions.filter((sub) => sub.user_id === profile.id)
      const engagementScore = Math.min(100, Math.round(studentSubmissions.length * 10))

      // Determine trend based on recent scores
      const sortedFeedback = [...studentFeedback].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )

      let trend = "stable"
      if (sortedFeedback.length >= 2) {
        const recent = sortedFeedback[0].total_score / sortedFeedback[0].max_score
        const previous = sortedFeedback[1].total_score / sortedFeedback[1].max_score
        if (recent > previous + 0.05) trend = "up"
        else if (recent < previous - 0.05) trend = "down"
      }

      // Get last active date from submissions
      const lastSubmission = studentSubmissions.sort(
        (a, b) => new Date(b.submission_date).getTime() - new Date(a.submission_date).getTime(),
      )[0]

      const lastActive = lastSubmission ? new Date(lastSubmission.submission_date).toLocaleDateString() : "Never"

      return {
        id: profile.id,
        name: profile.full_name,
        avatar: profile.avatar_url || `/placeholder.svg?height=40&width=40`,
        score: averageScore,
        engagement: engagementScore,
        risk: riskLevel,
        trend: trend,
        lastActive: lastActive,
      }
    })

    return studentData
  } catch (error) {
    console.error("Error fetching student performance data:", error)
    throw error
  }
}

// Fetch detailed information for a specific student
export async function fetchStudentDetails(studentId) {
  try {
    // Fetch profile data
    const { data: profile, error: profileError } = await supabase
      .from("synthetic_profiles")
      .select("*")
      .eq("id", studentId)
      .single()

    if (profileError) throw profileError

    // Fetch student feedback
    const { data: feedback, error: feedbackError } = await supabase
      .from("synthetic_feedback")
      .select(`
        id, 
        user_id, 
        exam_id, 
        total_score, 
        max_score, 
        feedback_data, 
        metrics_data, 
        created_at, 
        submission_id,
        exam_tbl(exam_title, course_id, exam_time_limit, exam_points, subject, deadline)
      `)
      .eq("user_id", studentId)
      .order("created_at", { ascending: false })

    if (feedbackError) throw feedbackError

    // Fetch exam submissions
    const { data: submissions, error: submissionsError } = await supabase
      .from("synthetic_submissions")
      .select(`
        submission_id, 
        user_id, 
        exam_id, 
        submission_date, 
        time_spent, 
        status,
        exam_tbl(exam_title, course_id)
      `)
      .eq("user_id", studentId)
      .order("submission_date", { ascending: false })

    if (submissionsError) throw submissionsError

    // Fetch course data for exams
    const courseIds = [...new Set(feedback.map((f) => f.exam_tbl.course_id))]
    const { data: courses, error: coursesError } = await supabase
      .from("course_tbl")
      .select("course_id, course_name")
      .in("course_id", courseIds)

    if (coursesError) throw coursesError

    // Fetch cheating logs
    const { data: cheatingLogs, error: cheatingLogsError } = await supabase
      .from("cheating_logs")
      .select(`
        id, 
        user_id, 
        exam_id, 
        copy_percentage, 
        time_spent_away, 
        cheat_risk_level, 
        timestamp,
        exam_tbl(exam_title)
      `)
      .eq("user_id", studentId)
      .order("timestamp", { ascending: false })

    if (cheatingLogsError) throw cheatingLogsError

    // Process exam data
    const exams = submissions.map((submission) => {
      const relatedFeedback = feedback.find((f) => f.submission_id === submission.submission_id)
      const course = courses.find((c) => c.course_id === submission.exam_tbl.course_id)

      return {
        id: submission.exam_id,
        title: submission.exam_tbl.exam_title,
        course: course ? course.course_name : "Unknown Course",
        submissionDate: new Date(submission.submission_date).toLocaleDateString(),
        timeSpent: formatTimeSpent(submission.time_spent),
        score: relatedFeedback ? Math.round((relatedFeedback.total_score / relatedFeedback.max_score) * 100) : 0,
        status: submission.status,
      }
    })

    // Process cheating logs
    const formattedCheatingLogs = cheatingLogs.map((log) => ({
      examId: log.exam_id,
      examTitle: log.exam_tbl.exam_title,
      copyPercentage: log.copy_percentage,
      timeSpentAway: formatTimeSpent(log.time_spent_away),
      riskLevel: log.cheat_risk_level,
      timestamp: new Date(log.timestamp).toLocaleDateString(),
    }))

    // Analyze strengths and weaknesses based on feedback
    const strengths = []
    const areasForImprovement = []

    feedback.forEach((f) => {
      if (f.feedback_data && typeof f.feedback_data === "object") {
        // This is a simplified example - actual implementation would depend on your feedback_data structure
        if (f.feedback_data.strengths) {
          strengths.push(...f.feedback_data.strengths)
        }
        if (f.feedback_data.weaknesses) {
          areasForImprovement.push(...f.feedback_data.weaknesses)
        }
      }
    })

    // Create activity log from submissions and other events
    const activityLog = [
      ...submissions.map((s) => ({
        type: "submission",
        description: `Submitted ${s.exam_tbl.exam_title}`,
        details: `Completed in ${formatTimeSpent(s.time_spent)}`,
        timestamp: new Date(s.submission_date).toLocaleDateString(),
      })),
      ...cheatingLogs.map((log) => ({
        type: "exam",
        description: `Potential integrity issue in ${log.exam_tbl.exam_title}`,
        details: `Risk level: ${log.cheat_risk_level}`,
        timestamp: new Date(log.timestamp).toLocaleDateString(),
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Generate risk factors based on performance and cheating logs
    const riskFactors = []

    // Low scores risk factor
    if (exams.filter((e) => e.score < 60).length > 0) {
      riskFactors.push({
        name: "Low Exam Scores",
        description: "Multiple exams with scores below 60%",
        severity: "medium",
        metrics: {
          "Low-scoring exams": exams.filter((e) => e.score < 60).length,
          "Average score": Math.round(exams.reduce((sum, e) => sum + e.score, 0) / exams.length) + "%",
        },
      })
    }

    // Cheating risk factor
    if (formattedCheatingLogs.length > 0) {
      riskFactors.push({
        name: "Potential Academic Integrity Issues",
        description: "System detected potential cheating behavior",
        severity: "high",
        metrics: {
          "Flagged exams": formattedCheatingLogs.length,
          "Highest copy %": Math.max(...formattedCheatingLogs.map((l) => l.copyPercentage)) + "%",
        },
      })
    }

    return {
      profile,
      exams,
      completedExams: submissions.length,
      totalExams: submissions.length, // This should ideally be the total exams assigned to the student
      activityLog,
      riskFactors,
      cheatingLogs: formattedCheatingLogs,
      lastLogin: submissions.length > 0 ? new Date(submissions[0].submission_date).toLocaleDateString() : "Never",
    }
  } catch (error) {
    console.error("Error fetching student details:", error)
    throw error
  }
}

// Helper function to format time spent
function formatTimeSpent(seconds) {
  if (!seconds) return "0s"

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`
  } else {
    return `${remainingSeconds}s`
  }
}


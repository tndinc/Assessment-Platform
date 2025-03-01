"use client"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Calendar,
  Clock,
  FileText,
  AlertTriangle,
  BookOpen,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from "lucide-react"

export function StudentDetailsModal({ isOpen, onClose, student, details, loading }) {
  const [activeTab, setActiveTab] = useState("overview")

  if (!student) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Student Details</span>
            {student.risk === "high" && (
              <Badge variant="destructive" className="ml-2">
                At Risk
              </Badge>
            )}
            {student.risk === "medium" && (
              <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100 ml-2">
                Watch
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>Comprehensive view of student performance and activity</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading student details...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-16 w-16">
                <AvatarImage src={student.avatar} alt={student.name} />
                <AvatarFallback className="text-lg">
                  {student.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">{student.name}</h2>
                <p className="text-muted-foreground">Course: {student.section}</p>
                <div className="flex items-center mt-1">
                  <span className="text-muted-foreground mr-2">Performance Trend:</span>
                  {student.trend === "up" && (
                    <span className="text-emerald-500 flex items-center text-sm">
                      <TrendingUp className="h-4 w-4 mr-1" /> Improving
                    </span>
                  )}
                  {student.trend === "down" && (
                    <span className="text-red-500 flex items-center text-sm">
                      <TrendingDown className="h-4 w-4 mr-1" /> Declining
                    </span>
                  )}
                  {student.trend === "stable" && (
                    <span className="text-blue-500 flex items-center text-sm">
                      <ArrowRight className="h-4 w-4 mr-1" /> Stable
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="exams">Exams</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="risk">Risk Factors</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{student.score}%</div>
                      <p className="text-xs text-muted-foreground">
                        {student.score > 75 ? "Above" : "Below"} class average by {Math.abs(student.score - 75)}%
                      </p>
                      <Progress
                        value={student.score}
                        className="h-2 mt-2"
                        indicatorClassName={
                          student.score >= 90
                            ? "bg-emerald-500"
                            : student.score >= 75
                              ? "bg-blue-500"
                              : student.score >= 60
                                ? "bg-amber-500"
                                : "bg-red-500"
                        }
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Engagement Level</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{student.engagement}%</div>
                      <p className="text-xs text-muted-foreground">Based on participation and activity</p>
                      <Progress value={student.engagement} className="h-2 mt-2" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Last Active</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg font-medium">{student.lastActive}</div>
                      <p className="text-xs text-muted-foreground flex items-center mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        Last login: {details?.lastLogin || "N/A"}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Completed Exams</CardTitle>
                    <CardDescription>Displays the number of exams the student has successfully submitted</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Exams</h4>
                        <div className="text-2xl font-bold">
                          {details?.exams?.length || 0}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="exams" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Exam Performance</CardTitle>
                    <CardDescription>Detailed breakdown of exam results</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {details?.exams && details.exams.length > 0 ? (
                      <div className="space-y-4">
                        {details.exams.map((exam, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-medium">{exam.title}</h4>
                                <p className="text-sm text-muted-foreground">{exam.course}</p>
                              </div>
                              <Badge
                                className={
                                  exam.score >= 90
                                    ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                                    : exam.score >= 75
                                      ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                                      : exam.score >= 60
                                        ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                                        : "bg-red-100 text-red-800 hover:bg-red-100"
                                }
                              >
                                {exam.score}%
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                                <span>Submitted: {exam.submissionDate}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                                <span>Time spent: {exam.timeSpent}</span>
                              </div>
                            </div>
                            <Progress
                              value={exam.score}
                              className="h-2 mt-3"
                              indicatorClassName={
                                exam.score >= 90
                                  ? "bg-emerald-500"
                                  : exam.score >= 75
                                    ? "bg-blue-500"
                                    : exam.score >= 60
                                      ? "bg-amber-500"
                                      : "bg-red-500"
                              }
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No exam data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Activity Log</CardTitle>
                    <CardDescription>Recent student activity and engagement</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {details?.activityLog && details.activityLog.length > 0 ? (
                      <div className="space-y-4">
                        {details.activityLog.map((activity, index) => (
                          <div key={index} className="flex items-start pb-4 border-b last:border-0 last:pb-0">
                            <div
                              className={`rounded-full p-2 mr-3 ${
                                activity.type === "exam"
                                  ? "bg-blue-100"
                                  : activity.type === "login"
                                    ? "bg-green-100"
                                    : activity.type === "submission"
                                      ? "bg-purple-100"
                                      : "bg-gray-100"
                              }`}
                            >
                              {activity.type === "exam" && <BookOpen className="h-4 w-4 text-blue-600" />}
                              {activity.type === "login" && <Calendar className="h-4 w-4 text-green-600" />}
                              {activity.type === "submission" && <FileText className="h-4 w-4 text-purple-600" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <p className="font-medium text-sm">{activity.description}</p>
                                <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{activity.details}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <BarChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No activity data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="risk" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Risk Assessment</CardTitle>
                    <CardDescription>Factors contributing to student risk level</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {student.risk === "high" || student.risk === "medium" ? (
                      <div className="space-y-6">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={student.risk === "high" ? "destructive" : "outline"}
                            className={
                              student.risk === "medium" ? "bg-amber-100 text-amber-800 hover:bg-amber-100" : ""
                            }
                          >
                            {student.risk === "high" ? "High Risk" : "Medium Risk"}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Based on performance and engagement metrics
                          </span>
                        </div>

                        {details?.riskFactors && details.riskFactors.length > 0 ? (
                          <div className="space-y-4">
                            {details.riskFactors.map((factor, index) => (
                              <div key={index} className="border rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                  <AlertTriangle
                                    className={`h-5 w-5 mt-0.5 ${
                                      factor.severity === "high"
                                        ? "text-red-500"
                                        : factor.severity === "medium"
                                          ? "text-amber-500"
                                          : "text-blue-500"
                                    }`}
                                  />
                                  <div>
                                    <h4 className="font-medium">{factor.name}</h4>
                                    <p className="text-sm text-muted-foreground mt-1">{factor.description}</p>

                                    {factor.metrics && (
                                      <div className="mt-3 grid gap-2">
                                        {Object.entries(factor.metrics).map(([key, value]) => (
                                          <div key={key} className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">{key}:</span>
                                            <span className="font-medium">{value}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No risk factor data available</p>
                          </div>
                        )}

                        {details?.cheatingLogs && details.cheatingLogs.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-3">Potential Academic Integrity Issues</h4>
                              <div className="space-y-3">
                                {details.cheatingLogs.map((log, index) => (
                                  <div
                                    key={index}
                                    className="border rounded-lg p-3 bg-red-50 dark:bg-red-900 dark:border-red-700"
                                  >
                                    <div className="flex justify-between">
                                      <h5 className="font-medium text-sm">Exam: {log.examTitle}</h5>
                                      <Badge variant="destructive">{log.riskLevel} Risk</Badge>
                                    </div>
                                    <div className="mt-2 grid gap-1 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Copy Percentage:</span>
                                        <span className="font-medium">{log.copyPercentage}%</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Time Away:</span>
                                        <span className="font-medium">{log.timeSpentAway}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Date:</span>
                                        <span className="font-medium">{log.timestamp}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                        <p className="font-medium text-emerald-500 mb-1">Low Risk Student</p>
                        <p className="text-muted-foreground">
                          This student is performing well with no significant risk factors
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


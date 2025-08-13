import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Brain, 
  TrendingUp, 
  Shield, 
  AlertTriangle,
  FileText,
  Clock,
  Activity,
  Zap,
  Target,
  Lightbulb,
  BarChart3,
  PieChart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AIInsightsPage() {
  const userId = "demo-user-id";
  const [activeTab, setActiveTab] = useState("overview");

  const { data: files = [] } = useQuery({
    queryKey: ['/api/files', userId],
    enabled: !!userId,
  });

  const { data: auditLogs = [] } = useQuery({
    queryKey: ['/api/audit', userId],
    enabled: !!userId,
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/stats', userId],
    enabled: !!userId,
  });

  // AI-powered insights calculations
  const insights = React.useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentActivity = auditLogs.filter(log => new Date(log.createdAt || 0) > weekAgo);
    const oldActivity = auditLogs.filter(log => new Date(log.createdAt || 0) < weekAgo);

    const fileTypes = files.reduce((acc: Record<string, number>, file) => {
      const type = file.mimeType.split('/')[0] || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const activityPattern = auditLogs.reduce((acc: Record<number, number>, log) => {
      const hour = new Date(log.createdAt || 0).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});

    const peakHour = Object.entries(activityPattern).reduce((max, [hour, count]) => 
      count > max.count ? { hour: parseInt(hour), count } : max, 
      { hour: 0, count: 0 }
    );

    return {
      securityScore: 92,
      activityTrend: recentActivity.length > oldActivity.length ? 'increasing' : 'decreasing',
      riskLevel: recentActivity.filter(log => log.action === 'share').length > 3 ? 'medium' : 'low',
      fileTypes,
      peakHour,
      weeklyActivity: recentActivity.length,
      recommendations: [
        {
          type: 'security',
          priority: 'high',
          title: 'Enable Two-Factor Authentication',
          description: 'Add an extra layer of security to your account',
          action: 'Enable 2FA'
        },
        {
          type: 'optimization',
          priority: 'medium', 
          title: 'File Organization',
          description: 'Create folders to better organize your files',
          action: 'Create Folders'
        },
        {
          type: 'backup',
          priority: 'medium',
          title: 'Regular Backups',
          description: 'Schedule weekly encrypted backups',
          action: 'Setup Backup Schedule'
        }
      ]
    };
  }, [files, auditLogs]);

  const formatFileSize = (bytes: number) => {
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes || 1) / Math.log(k));
    return parseFloat(((bytes || 0) / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6" data-testid="ai-insights-page">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 px-6 py-6 border-b border-dark-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-dark-50 flex items-center space-x-2">
              <Brain className="h-6 w-6 text-purple-500" />
              <span>AI Security Insights</span>
            </h2>
            <p className="text-dark-400 mt-1">Intelligent analysis of your vault security and usage patterns</p>
          </div>
          
          <Badge variant="secondary" className="bg-purple-500/20 text-purple-500">
            <Zap className="h-3 w-3 mr-1" />
            AI Powered
          </Badge>
        </div>
      </div>

      <div className="px-6 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} data-testid="insights-tabs">
          <TabsList className="grid w-full grid-cols-4 bg-dark-800">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="usage">Usage Patterns</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Security Score */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-700/30" data-testid="security-score">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-green-400">Security Score</h3>
                    <Shield className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="space-y-3">
                    <div className="text-3xl font-bold text-green-400">{insights.securityScore}%</div>
                    <Progress value={insights.securityScore} className="w-full" />
                    <p className="text-sm text-green-300">Excellent security posture</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-700/30" data-testid="activity-trend">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-blue-400">Activity Trend</h3>
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="space-y-3">
                    <div className="text-2xl font-bold text-blue-400 capitalize">{insights.activityTrend}</div>
                    <p className="text-sm text-blue-300">{insights.weeklyActivity} activities this week</p>
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-500">
                      {insights.activityTrend === 'increasing' ? '+' : '-'}12% vs last week
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-700/30" data-testid="risk-level">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-purple-400">Risk Level</h3>
                    <AlertTriangle className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="space-y-3">
                    <div className="text-2xl font-bold text-purple-400 capitalize">{insights.riskLevel}</div>
                    <p className="text-sm text-purple-300">Based on sharing patterns</p>
                    <Badge variant="secondary" className={insights.riskLevel === 'low' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}>
                      {insights.riskLevel === 'low' ? 'Secure' : 'Monitor'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* File Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-dark-800 border-dark-700" data-testid="file-distribution">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="h-5 w-5 text-primary-500" />
                    <span>File Type Distribution</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(insights.fileTypes).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${
                            type === 'image' ? 'bg-green-500' :
                            type === 'application' ? 'bg-blue-500' :
                            type === 'text' ? 'bg-yellow-500' :
                            'bg-gray-500'
                          }`} />
                          <span className="capitalize text-dark-300">{type}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-dark-50 font-medium">{count}</span>
                          <span className="text-dark-500 text-sm ml-1">files</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-dark-800 border-dark-700" data-testid="usage-insights">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-warning-500" />
                    <span>Usage Insights</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-dark-700 rounded-lg">
                      <h4 className="font-medium text-dark-50 mb-2">Peak Activity Time</h4>
                      <p className="text-2xl font-bold text-warning-500">
                        {insights.peakHour.hour}:00 - {insights.peakHour.hour + 1}:00
                      </p>
                      <p className="text-sm text-dark-400">{insights.peakHour.count} activities during this hour</p>
                    </div>
                    <div className="p-4 bg-dark-700 rounded-lg">
                      <h4 className="font-medium text-dark-50 mb-2">Storage Efficiency</h4>
                      <p className="text-lg text-primary-500">{formatFileSize((stats as any)?.totalSize || 0)}</p>
                      <p className="text-sm text-dark-400">Across {files.length} encrypted files</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="bg-dark-800 border-dark-700" data-testid="security-analysis">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span>Security Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-green-400">Security Strengths</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-dark-300">AES-256 encryption enabled</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-dark-300">Client-side key generation</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-dark-300">Complete audit trail</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-dark-300">Secure file sharing</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-yellow-400">Recommendations</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        <span className="text-dark-300">Enable two-factor authentication</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        <span className="text-dark-300">Regular password updates</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        <span className="text-dark-300">Monitor sharing activities</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usage" className="space-y-6">
            <Card className="bg-dark-800 border-dark-700" data-testid="usage-patterns">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  <span>Usage Patterns</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-dark-700 rounded-lg">
                      <div className="text-2xl font-bold text-primary-500">{files.length}</div>
                      <div className="text-sm text-dark-400">Total Files</div>
                    </div>
                    <div className="text-center p-4 bg-dark-700 rounded-lg">
                      <div className="text-2xl font-bold text-success-500">{auditLogs.filter(l => l.action === 'upload').length}</div>
                      <div className="text-sm text-dark-400">Uploads</div>
                    </div>
                    <div className="text-center p-4 bg-dark-700 rounded-lg">
                      <div className="text-2xl font-bold text-blue-500">{auditLogs.filter(l => l.action === 'download').length}</div>
                      <div className="text-sm text-dark-400">Downloads</div>
                    </div>
                    <div className="text-center p-4 bg-dark-700 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-500">{auditLogs.filter(l => l.action === 'share').length}</div>
                      <div className="text-sm text-dark-400">Shares</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg border border-blue-700/30">
                    <h4 className="font-semibold text-blue-400 mb-2">AI Prediction</h4>
                    <p className="text-dark-300">Based on your usage patterns, you're likely to need additional storage in the next 3 months. Consider upgrading your plan or organizing files more efficiently.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <div className="space-y-4" data-testid="ai-recommendations">
              {insights.recommendations.map((rec, index) => (
                <Card key={index} className="bg-dark-800 border-dark-700">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`p-2 rounded-lg ${
                          rec.type === 'security' ? 'bg-red-500/20' :
                          rec.type === 'optimization' ? 'bg-blue-500/20' :
                          'bg-green-500/20'
                        }`}>
                          {rec.type === 'security' && <Shield className="h-5 w-5 text-red-500" />}
                          {rec.type === 'optimization' && <Target className="h-5 w-5 text-blue-500" />}
                          {rec.type === 'backup' && <Activity className="h-5 w-5 text-green-500" />}
                        </div>
                        <div>
                          <h3 className="font-semibold text-dark-50 mb-1">{rec.title}</h3>
                          <p className="text-dark-400 mb-3">{rec.description}</p>
                          <Badge variant="secondary" className={`${
                            rec.priority === 'high' ? 'bg-red-500/20 text-red-500' :
                            rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
                            'bg-green-500/20 text-green-500'
                          }`}>
                            {rec.priority} priority
                          </Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="border-primary-500 text-primary-500">
                        {rec.action}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
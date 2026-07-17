import React from "react";
import * as L from "lucide-react";

const icon = (Icon) =>
  React.forwardRef(({ sx, fontSize, color, ...props }, ref) => {
    const size =
      sx?.fontSize || (fontSize === "small" ? 16 : fontSize === "large" ? 28 : 20);
    return (
      <Icon
        ref={ref}
        size={size}
        color={color || sx?.color || "currentColor"}
        strokeWidth={2.2}
        {...props}
      />
    );
  });

function GoogleShim(props) {
  return (
    <span style={{ fontWeight: 900, fontSize: props.size || 20, lineHeight: 1 }}>
      G
    </span>
  );
}

function DownloadShim(props) {
  return <L.Upload {...props} style={{ transform: "rotate(180deg)" }} />;
}

export const AccessTime = icon(L.Clock);
export const AccountTree = icon(L.Network);
export const Add = icon(L.Plus);
export const AllInclusive = icon(L.Repeat);
export const Analytics = icon(L.TrendingUp);
export const ArrowBack = icon(L.ArrowLeft);
export const ArrowForward = icon(L.ArrowRight);
export const Article = icon(L.FileText);
export const AudioFile = icon(L.FileAudio);
export const AutoAwesome = icon(L.Sparkles);
export const AutoStories = icon(L.BookOpen);
export const Badge = icon(L.BadgeCheck);
export const Bookmark = icon(L.Bookmark);
export const BookmarkBorder = icon(L.BookmarkPlus);
export const Calculate = icon(L.Calculator);
export const CalendarMonth = icon(L.Calendar);
export const CalendarToday = icon(L.Calendar);
export const Cancel = icon(L.X);
export const Check = icon(L.Check);
export const CheckCircle = icon(L.CheckCircle);
export const CheckCircleOutline = icon(L.CheckCircle);
export const Circle = icon(L.Circle);
export const CloudUpload = icon(L.CloudUpload);
export const Close = icon(L.X);
export const Coffee = icon(L.Coffee);
export const ContentCopy = icon(L.Copy);
export const ContentPaste = icon(L.Clipboard);
export const Delete = icon(L.Trash2);
export const DeleteOutline = icon(L.Trash2);
export const Description = icon(L.FileText);
export const DoneAll = icon(L.SquareCheck);
export const Download = icon(DownloadShim);
export const Edit = icon(L.Edit);
export const EmojiEvents = icon(L.Trophy);
export const ErrorOutlineRounded = icon(L.AlertCircle);
export const ExpandLess = icon(L.ChevronUp);
export const ExpandMore = icon(L.ChevronDown);
export const FilterList = icon(L.Filter);
export const FitnessCenter = icon(L.Dumbbell);
export const Flag = icon(L.Flag);
export const GitHub = icon(L.GitBranch);
export const Google = icon(GoogleShim);
export const History = icon(L.History);
export const Image = icon(L.FileImage);
export const InboxRounded = icon(L.Inbox);
export const Info = icon(L.Info);
export const KeyboardArrowLeft = icon(L.ChevronLeft);
export const KeyboardArrowRight = icon(L.ChevronRight);
export const LibraryBooks = icon(L.Library);
export const Lightbulb = icon(L.Lightbulb);
export const Link = icon(L.Link);
export const LocalFireDepartment = icon(L.Flame);
export const Lock = icon(L.Lock);
export const Login = icon(L.LogIn);
export const Mail = icon(L.Mail);
export const Menu = icon(L.MoreHorizontal);
export const MenuBook = icon(L.BookOpen);
export const Mic = icon(L.Mic);
export const Microsoft = icon(L.Square);
export const MilitaryTech = icon(L.Medal);
export const NavigateBefore = icon(L.ChevronLeft);
export const NavigateNext = icon(L.ChevronRight);
export const Notes = icon(L.NotebookText);
export const Notifications = icon(L.Bell);
export const NotificationsActive = icon(L.BellRing);
export const NotificationsNone = icon(L.Bell);
export const OpenInNew = icon(L.ExternalLink);
export const Person = icon(L.UserRound);
export const PersonAdd = icon(L.UserPlus);
export const PhotoCamera = icon(L.Camera);
export const PictureAsPdf = icon(L.FileText);
export const PlayArrow = icon(L.Play);
export const PlayCircle = icon(L.PlayCircle);
export const Preview = icon(L.MonitorPlay);
export const Psychology = icon(L.Brain);
export const Quiz = icon(L.FileQuestion);
export const QuizOutlined = icon(L.FileQuestion);
export const RadioButtonUnchecked = icon(L.Circle);
export const Refresh = icon(L.RefreshCw);
export const RestartAlt = icon(L.RefreshCw);
export const RocketLaunch = icon(L.Rocket);
export const Save = icon(L.Save);
export const Schedule = icon(L.Clock);
export const School = icon(L.GraduationCap);
export const Search = icon(L.Search);
export const Security = icon(L.Shield);
export const Send = icon(L.Send);
export const Settings = icon(L.Settings);
export const Share = icon(L.Share2);
export const Shuffle = icon(L.Shuffle);
export const SmartToy = icon(L.Bot);
export const Speed = icon(L.Zap);
export const Star = icon(L.Star);
export const Stop = icon(L.StopCircle);
export const TaskAlt = icon(L.SquareCheck);
export const ThumbDown = icon(L.ThumbsDown);
export const ThumbUp = icon(L.ThumbsUp);
export const Timeline = icon(L.Network);
export const Timer = icon(L.Timer);
export const TrendingDown = icon(L.TrendingDown);
export const TrendingUp = icon(L.TrendingUp);
export const Tune = icon(L.ListFilter);
export const Upload = icon(L.Upload);
export const UploadFile = icon(L.FileUp);
export const VideoFile = icon(L.FileVideo);
export const Warning = icon(L.AlertCircle);
export const Whatshot = icon(L.Flame);

export const CircleIcon = Circle;
export const CloseIcon = Close;
export const HistoryIcon = History;
export const ImageIcon = Image;
export const InfoIcon = Info;
export const SaveIcon = Save;
export const SendIcon = Send;
export const StarIcon = Star;
export const TimerIcon = Timer;

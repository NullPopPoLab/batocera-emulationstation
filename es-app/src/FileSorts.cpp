#include <Settings.h>
#include "FileSorts.h"

#include "utils/StringUtil.h"
#include "LocaleES.h"

namespace FileSorts
{
	static Singleton* sInstance = nullptr;

	Singleton* getInstance()
	{
		if (sInstance == nullptr)
			sInstance = new Singleton();

		return sInstance;
	}

	void reset()
	{
		if (sInstance != nullptr)
			delete sInstance;

		sInstance = nullptr;
	}

	const std::vector<SortType>& getSortTypes()
	{
		return getInstance()->mSortTypes;
	}

	SortType getSortType(int sortId)
	{
		for (auto sort : getSortTypes())
			if (sort.id == sortId)
				return sort;

		return getSortTypes().at(0);
	}

	Singleton::Singleton()
	{
		// must be ordered by SortId 
		mSortTypes.push_back(SortType(DISPNAME_ASCENDING, &compareDispName, true, _("DISPNAME, ASCENDING"), _U("\uF15d ")));
		mSortTypes.push_back(SortType(DISPNAME_DESCENDING, &compareDispName, false, _("DISPNAME, DESCENDING"), _U("\uF15e ")));
		mSortTypes.push_back(SortType(SORTNAME_ASCENDING, &compareSortName, true, _("SORTNAME, ASCENDING"), _U("\uF15d ")));
		mSortTypes.push_back(SortType(SORTNAME_DESCENDING, &compareSortName, false, _("SORTNAME, DESCENDING"), _U("\uF15e ")));
		mSortTypes.push_back(SortType(FILENAME_ASCENDING, &compareFileName, true, _("FILENAME, ASCENDING"), _U("\uF15d ")));
		mSortTypes.push_back(SortType(FILENAME_DESCENDING, &compareFileName, false, _("FILENAME, DESCENDING"), _U("\uF15e ")));
		mSortTypes.push_back(SortType(RATING_ASCENDING, &compareRating, true, _("RATING, ASCENDING"), _U("\uF165 ")));
		mSortTypes.push_back(SortType(RATING_DESCENDING, &compareRating, false, _("RATING, DESCENDING"), _U("\uF164 ")));
		mSortTypes.push_back(SortType(TIMESPLAYED_ASCENDING, &compareTimesPlayed, true, _("TIMES PLAYED, ASCENDING"), _U("\uF160 ")));
		mSortTypes.push_back(SortType(TIMESPLAYED_DESCENDING, &compareTimesPlayed, false, _("TIMES PLAYED, DESCENDING"), _U("\uF161 ")));
		mSortTypes.push_back(SortType(LASTPLAYED_ASCENDING, &compareLastPlayed, true, _("LAST PLAYED, ASCENDING"), _U("\uF160 ")));
		mSortTypes.push_back(SortType(LASTPLAYED_DESCENDING, &compareLastPlayed, false, _("LAST PLAYED, DESCENDING"), _U("\uF161 ")));
		mSortTypes.push_back(SortType(NUMBERPLAYERS_ASCENDING, &compareNumPlayers, true, _("NUMBER PLAYERS, ASCENDING"), _U("\uF162 ")));
		mSortTypes.push_back(SortType(NUMBERPLAYERS_DESCENDING, &compareNumPlayers, false, _("NUMBER PLAYERS, DESCENDING"), _U("\uF163 ")));
		mSortTypes.push_back(SortType(RELEASEDATE_ASCENDING, &compareReleaseDate, true, _("RELEASE DATE, ASCENDING"), _U("\uF160 ")));
		mSortTypes.push_back(SortType(RELEASEDATE_DESCENDING, &compareReleaseDate, false, _("RELEASE DATE, DESCENDING"), _U("\uF161 ")));
		mSortTypes.push_back(SortType(GENRE_ASCENDING, &compareGenre, true, _("GENRE, ASCENDING"), _U("\uF15d ")));		
		mSortTypes.push_back(SortType(GENRE_DESCENDING, &compareGenre, false, _("GENRE, DESCENDING"), _U("\uF15e ")));
		mSortTypes.push_back(SortType(DEVELOPER_ASCENDING, &compareDeveloper, true, _("DEVELOPER, ASCENDING"), _U("\uF15d ")));
		mSortTypes.push_back(SortType(DEVELOPER_DESCENDING, &compareDeveloper, false, _("DEVELOPER, DESCENDING"), _U("\uF15e ")));
		mSortTypes.push_back(SortType(PUBLISHER_ASCENDING, &comparePublisher, true, _("PUBLISHER, ASCENDING"), _U("\uF15d ")));
		mSortTypes.push_back(SortType(PUBLISHER_DESCENDING, &comparePublisher, false, _("PUBLISHER, DESCENDING"), _U("\uF15e ")));
		mSortTypes.push_back(SortType(SYSTEM_ASCENDING, &compareSystem, true, _("SYSTEM, ASCENDING"), _U("\uF15d ")));
		mSortTypes.push_back(SortType(SYSTEM_DESCENDING, &compareSystem, false, _("SYSTEM, DESCENDING"), _U("\uF15e ")));
		mSortTypes.push_back(SortType(FILECREATION_DATE_ASCENDING, &compareFileCreationDate, true, _("FILE CREATION DATE, ASCENDING"), _U("\uF160 ")));
		mSortTypes.push_back(SortType(FILECREATION_DATE_DESCENDING, &compareFileCreationDate, false, _("FILE CREATION DATE, DESCENDING"), _U("\uF161 ")));
		mSortTypes.push_back(SortType(GAMETIME_ASCENDING, &compareGameTime, true, _("GAME TIME, ASCENDING"), _U("\uF160 ")));
		mSortTypes.push_back(SortType(GAMETIME_DESCENDING, &compareGameTime, false, _("GAME TIME, DESCENDING"), _U("\uF161 ")));

		mSortTypes.push_back(SortType(SYSTEM_RELEASEDATE_ASCENDING, &compareSystemReleaseYear, true, _("SYSTEM, RELEASE YEAR, ASCENDING"), _U("\uF160 ")));
		mSortTypes.push_back(SortType(SYSTEM_RELEASEDATE_DESCENDING, &compareSystemReleaseYear, false, _("SYSTEM, RELEASE YEAR, DESCENDING"), _U("\uF161 ")));
		mSortTypes.push_back(SortType(RELEASEDATE_SYSTEM_ASCENDING, &compareReleaseYearSystem, true, _("RELEASE YEAR, SYSTEM, ASCENDING"), _U("\uF160 ")));
		mSortTypes.push_back(SortType(RELEASEDATE_SYSTEM_DESCENDING, &compareReleaseYearSystem, false, _("RELEASE YEAR, SYSTEM, DESCENDING"), _U("\uF161 ")));
	}

	//returns if file1 should come before file2
	bool compareDispName(const FileData* file1, const FileData* file2)
	{
		if (Settings::FolderAlwaysFirst() && (file1->getType() != file2->getType()))
		{
			return file1->getType() == FOLDER;
		}
		// we compare the actual metadata name, as collection files have the system appended which messes up the order
		auto name1 = ((FileData *) file1)->getName();
		auto name2 = ((FileData *) file2)->getName();

		if (Settings::IgnoreLeadingArticles())
		{
			static auto articles = Utils::String::commaStringToVector(_("A,AN,THE"));
			name1 = stripLeadingArticle(name1, articles);
			name2 = stripLeadingArticle(name2, articles);
		}
		if(name1==name2)return compareFileName(file1,file2);

		return Utils::String::compareIgnoreCase(name1, name2) < 0;
	}

	bool compareSortName(const FileData* file1, const FileData* file2)
	{
		if (Settings::FolderAlwaysFirst() && (file1->getType() != file2->getType()))
		{
			return file1->getType() == FOLDER;
		}
		// we compare the actual metadata name, as collection files have the system appended which messes up the order
		auto name1 = ((FileData *) file1)->getSortName();
		auto name2 = ((FileData *) file2)->getSortName();
		if(name1==name2)return compareFileName(file1,file2);

		return Utils::String::compareIgnoreCase(name1, name2) < 0;
	}

	bool compareFileName(const FileData* file1, const FileData* file2)
	{
		if (Settings::FolderAlwaysFirst() && (file1->getType() != file2->getType()))
		{
			return file1->getType() == FOLDER;
		}
		// we compare the actual metadata name, as collection files have the system appended which messes up the order
		auto name1 = ((FileData *) file1)->getFileName();
		auto name2 = ((FileData *) file2)->getFileName();

		if (Settings::IgnoreLeadingArticles())
		{
			static auto articles = Utils::String::commaStringToVector(_("A,AN,THE"));
			name1 = stripLeadingArticle(name1, articles);
			name2 = stripLeadingArticle(name2, articles);
		}

		return Utils::String::compareIgnoreCase(name1, name2) < 0;
	}

	std::string stripLeadingArticle(const std::string &string, const std::vector<std::string> &articles)
	{
		const auto candidate = Utils::String::trim(string);
		const auto index = candidate.find_first_of(" \t\r\n");
		if (index == std::string::npos)
		{
			return string;
		}
		const auto maybeArticle = candidate.substr(0, index);
		for (auto &article: articles)
		{
			if (Utils::String::compareIgnoreCase(article, maybeArticle) == 0)
			{
				return Utils::String::trim(candidate.substr(article.length()));
			}
		}
		return string;
	}

	bool compareRating(const FileData* file1, const FileData* file2)
	{
		float num1=(file1)->getMetadata().getInt(MetaDataId::Rating);
		float num2=(file2)->getMetadata().getInt(MetaDataId::Rating);
		if(num1==num2)return compareSortName(file1,file2);
		return num1 < num2;
	}

	bool compareTimesPlayed(const FileData* file1, const FileData* file2)
	{
		//only games have playcount metadata
		if (file1->getMetadata().getType() == GAME_METADATA && file2->getMetadata().getType() == GAME_METADATA)
			return (file1)->getMetadata().getInt(MetaDataId::PlayCount) < (file2)->getMetadata().getInt(MetaDataId::PlayCount);

		return compareSortName(file1,file2);
	}

	bool compareGameTime(const FileData* file1, const FileData* file2)
	{
		//only games have playcount metadata
		if (file1->getMetadata().getType() == GAME_METADATA && file2->getMetadata().getType() == GAME_METADATA)
			return (file1)->getMetadata().getInt(MetaDataId::GameTime) < (file2)->getMetadata().getInt(MetaDataId::GameTime);

		return compareSortName(file1,file2);
	}

	bool compareLastPlayed(const FileData* file1, const FileData* file2)
	{
		// since it's stored as an ISO string (YYYYMMDDTHHMMSS), we can compare as a string
		// as it's a lot faster than the time casts and then time comparisons
		auto time1=(file1)->getMetadata().get(MetaDataId::LastPlayed);
		auto time2=(file2)->getMetadata().get(MetaDataId::LastPlayed);
		if(time1==time2)return compareSortName(file1,file2);
		return time1 < time2;
	}

	bool compareNumPlayers(const FileData* file1, const FileData* file2)
	{
		int num1=(file1)->getMetadata().getInt(MetaDataId::Players);
		int num2=(file2)->getMetadata().getInt(MetaDataId::Players);
		if(num1==num2)return compareSortName(file1,file2);
		return num1 < num2;
	}

	bool compareSystemReleaseYear(const FileData* file1, const FileData* file2)
	{
		std::string system1 = ((FileData*)file1)->getSourceFileData()->getSystemName();
		std::string system2 = ((FileData*)file2)->getSourceFileData()->getSystemName();

		if (system1 == system2)
		{
			std::string year1 = file1->getMetadata().get(MetaDataId::ReleaseDate).substr(0, 4);
			std::string year2 = file2->getMetadata().get(MetaDataId::ReleaseDate).substr(0, 4);
			if(year1==year2)return compareSortName(file1,file2);
			return year1 < year2;
		}
		return Utils::String::compareIgnoreCase(system1, system2) < 0;
	}

	bool compareReleaseYearSystem(const FileData* file1, const FileData* file2)
	{
		std::string year1 = file1->getMetadata().get(MetaDataId::ReleaseDate).substr(0, 4);
		std::string year2 = file2->getMetadata().get(MetaDataId::ReleaseDate).substr(0, 4);

		if (year1 == year2)
		{
			std::string system1 = ((FileData*)file1)->getSourceFileData()->getSystemName();
			std::string system2 = ((FileData*)file2)->getSourceFileData()->getSystemName();
			if(system1==system2)return compareSortName(file1,file2);
			return Utils::String::compareIgnoreCase(system1, system2) < 0;
		}

		return year1 < year2;
	}

	bool compareReleaseDate(const FileData* file1, const FileData* file2)
	{
		// since it's stored as an ISO string (YYYYMMDDTHHMMSS), we can compare as a string
		// as it's a lot faster than the time casts and then time comparisons
		auto time1=(file1)->getMetadata().get(MetaDataId::ReleaseDate);
		auto time2=(file2)->getMetadata().get(MetaDataId::ReleaseDate);
		if(time1==time2)return compareSortName(file1,file2);
		return time1 < time2;
	}

	bool compareFileCreationDate(const FileData* file1, const FileData* file2)
	{
		// As this sort mode is rarely used, don't care about storing date, always ask the file system
		auto dt1 = Utils::FileSystem::getFileCreationDate(file1->getPath()).getIsoString();
		auto dt2 = Utils::FileSystem::getFileCreationDate(file2->getPath()).getIsoString();
		return dt1 < dt2;
	}

	bool compareGenre(const FileData* file1, const FileData* file2)
	{
		std::string genre1 = file1->getMetadata().get(MetaDataId::Genre);
		std::string genre2 = file2->getMetadata().get(MetaDataId::Genre);
		if(genre1==genre2)return compareSortName(file1,file2);
		return Utils::String::compareIgnoreCase(genre1, genre2) < 0;
	}

	bool compareDeveloper(const FileData* file1, const FileData* file2)
	{
		std::string developer1 = file1->getMetadata().get(MetaDataId::Developer);
		std::string developer2 = file2->getMetadata().get(MetaDataId::Developer);
		if(developer1==developer2)return compareReleaseDate(file1,file2);
		return Utils::String::compareIgnoreCase(developer1, developer2) < 0;
	}

	bool comparePublisher(const FileData* file1, const FileData* file2)
	{
		std::string publisher1 = file1->getMetadata().get(MetaDataId::Publisher);
		std::string publisher2 = file2->getMetadata().get(MetaDataId::Publisher);
		if(publisher1==publisher2)return compareReleaseDate(file1,file2);
		return Utils::String::compareIgnoreCase(publisher1, publisher2) < 0;
	}

	bool compareSystem(const FileData* file1, const FileData* file2)
	{
		std::string system1 = ((FileData*)file1)->getSourceFileData()->getSystemName();
		std::string system2 = ((FileData*)file2)->getSourceFileData()->getSystemName();
		if(system1==system2)return compareSortName(file1,file2);
		return Utils::String::compareIgnoreCase(system1, system2) < 0;		
	}
};

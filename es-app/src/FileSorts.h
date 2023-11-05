#pragma once
#ifndef ES_APP_FILE_SORTS_H
#define ES_APP_FILE_SORTS_H

#include "FileData.h"
#include <vector>

namespace FileSorts
{
	enum SortId : unsigned int
	{
		DISPNAME_ASCENDING=0,
		DISPNAME_DESCENDING,
		SORTNAME_ASCENDING,
		SORTNAME_DESCENDING,
		FILENAME_ASCENDING,
		FILENAME_DESCENDING,
		RATING_ASCENDING,
		RATING_DESCENDING,
		TIMESPLAYED_ASCENDING,
		TIMESPLAYED_DESCENDING,
		LASTPLAYED_ASCENDING,
		LASTPLAYED_DESCENDING,
		NUMBERPLAYERS_ASCENDING,
		NUMBERPLAYERS_DESCENDING,
		RELEASEDATE_ASCENDING,
		RELEASEDATE_DESCENDING,
		GENRE_ASCENDING,
		GENRE_DESCENDING,
		DEVELOPER_ASCENDING,
		DEVELOPER_DESCENDING,
		PUBLISHER_ASCENDING,
		PUBLISHER_DESCENDING,
		SYSTEM_ASCENDING,
		SYSTEM_DESCENDING,
		FILECREATION_DATE_ASCENDING,
		FILECREATION_DATE_DESCENDING,
		GAMETIME_ASCENDING,
		GAMETIME_DESCENDING,
		SYSTEM_RELEASEDATE_ASCENDING,
		SYSTEM_RELEASEDATE_DESCENDING,
		RELEASEDATE_SYSTEM_ASCENDING,
		RELEASEDATE_SYSTEM_DESCENDING,
	};

	typedef bool ComparisonFunction(const FileData* a, const FileData* b);

	struct SortType
	{
		int id;
		ComparisonFunction* comparisonFunction;
		bool ascending;
		std::string description;
		std::string icon;

		SortType(int sortId, ComparisonFunction* sortFunction, bool sortAscending, const std::string & sortDescription, const std::string & iconId = "")
			: id(sortId), comparisonFunction(sortFunction), ascending(sortAscending), description(sortDescription), icon(iconId) {}
	};

	class Singleton
	{
	public:
		Singleton();
	
		std::vector<SortType> mSortTypes;
	};

	void reset();
	SortType getSortType(int sortId);
	const std::vector<SortType>& getSortTypes();

	bool compareDispName(const FileData* file1, const FileData* file2);
	bool compareSortName(const FileData* file1, const FileData* file2);
	bool compareFileName(const FileData* file1, const FileData* file2);
	bool compareRating(const FileData* file1, const FileData* file2);
	bool compareTimesPlayed(const FileData* file1, const FileData* fil2);
	bool compareLastPlayed(const FileData* file1, const FileData* file2);
	bool compareNumPlayers(const FileData* file1, const FileData* file2);
	bool compareReleaseDate(const FileData* file1, const FileData* file2);
	bool compareGenre(const FileData* file1, const FileData* file2);
	bool compareDeveloper(const FileData* file1, const FileData* file2);
	bool comparePublisher(const FileData* file1, const FileData* file2);
	bool compareSystem(const FileData* file1, const FileData* file2);
	bool compareFileCreationDate(const FileData* file1, const FileData* file2);
	bool compareGameTime(const FileData* file1, const FileData* file2);	

	bool compareSystemReleaseYear(const FileData* file1, const FileData* file2);
	bool compareReleaseYearSystem(const FileData* file1, const FileData* file2);

	std::string stripLeadingArticle(const std::string &string, const std::vector<std::string> &articles);
};
#endif // ES_APP_FILE_SORTS_H
